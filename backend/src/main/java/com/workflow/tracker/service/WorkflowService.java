package com.workflow.tracker.service;

import com.workflow.tracker.model.Comment;
import com.workflow.tracker.model.StepType;
import com.workflow.tracker.model.Workflow;
import com.workflow.tracker.model.WorkflowStep;
import com.workflow.tracker.repository.InMemoryWorkflowRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * Service layer for all Workflow CRUD and step/comment operations.
 *
 * Thread-safety strategy
 * ----------------------
 * Simple reads (getAllWorkflows, getWorkflow) use ConcurrentHashMap's inherently
 * thread-safe get/values methods — no additional locking is needed.
 *
 * Compound read-modify-write operations (updateWorkflow, updateStep, addComment,
 * deleteComment) are executed inside {@link InMemoryWorkflowRepository#compute},
 * which delegates to {@link java.util.concurrent.ConcurrentHashMap#compute}.
 * That method holds a striped lock on the bucket for the duration of the lambda,
 * preventing any other thread from observing or modifying the same key
 * concurrently. The lambda therefore executes as an atomic unit.
 *
 * createWorkflow builds the full object before inserting it, so a simple
 * {@link InMemoryWorkflowRepository#save} is sufficient — there is no prior
 * state to read.
 *
 * deleteWorkflow delegates to ConcurrentHashMap#remove, which is itself atomic.
 */
@Service
public class WorkflowService {

    private static final Logger logger = LoggerFactory.getLogger(WorkflowService.class);
    private final InMemoryWorkflowRepository repository;

    public WorkflowService(InMemoryWorkflowRepository repository) {
        this.repository = repository;
    }

    // -------------------------------------------------------------------------
    // Workflow CRUD
    // -------------------------------------------------------------------------

    /**
     * Returns all workflows currently stored, in no guaranteed order.
     */
    public List<Workflow> getAllWorkflows() {
        return repository.findAll();
    }

    /**
     * Returns the workflow with the given id.
     *
     * @throws ResponseStatusException HTTP 404 if not found
     */
    public Workflow getWorkflow(String id) {
        return repository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("Workflow not found: id={}", id);
                    return new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Workflow not found: " + id);
                });
    }

    /**
     * Creates a new workflow and auto-generates one {@link WorkflowStep} for each
     * {@link StepType} (in enum declaration order).
     *
     * @param name        workflow display name
     * @param description optional free-text description
     * @return the persisted workflow
     */
    public Workflow createWorkflow(String name, String description) {
        List<WorkflowStep> steps = new ArrayList<>();
        for (StepType type : StepType.values()) {
            steps.add(WorkflowStep.builder()
                    .id(UUID.randomUUID().toString())
                    .type(type)
                    .title(formatDefaultTitle(type))
                    .description("")
                    .progress(0)
                    .comments(new ArrayList<>())
                    .build());
        }

        Workflow workflow = Workflow.builder()
                .id(UUID.randomUUID().toString())
                .name(name)
                .description(description)
                .createdAt(LocalDateTime.now())
                .steps(steps)
                .build();

        repository.save(workflow);
        logger.info("Workflow created: id={}, name={}, stepCount={}",
                workflow.getId(), workflow.getName(), workflow.getSteps().size());
        return workflow;
    }

    /**
     * Updates the mutable metadata fields (name, description) of an existing workflow.
     * All other fields (id, createdAt, steps) are left untouched.
     *
     * The operation is atomic: the entire read-modify-write sequence is protected by
     * ConcurrentHashMap#compute.
     *
     * @throws ResponseStatusException HTTP 404 if not found
     */
    public Workflow updateWorkflow(String id, String name, String description) {
        Workflow result = repository.compute(id, (key, existing) -> {
            if (existing == null) {
                return null; // signal absence; exception is thrown below
            }
            existing.setName(name);
            existing.setDescription(description);
            return existing;
        });

        if (result == null) {
            logger.warn("Workflow not found for update: id={}", id);
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Workflow not found: " + id);
        }
        logger.debug("Workflow updated: id={}, name={}", result.getId(), result.getName());
        return result;
    }

    /**
     * Deletes a workflow by id. No-op if it does not exist (idempotent).
     */
    public void deleteWorkflow(String id) {
        repository.deleteById(id);
        logger.info("Workflow deleted: id={}", id);
    }

    // -------------------------------------------------------------------------
    // Step operations
    // -------------------------------------------------------------------------

    /**
     * Partially updates a step within a workflow.
     *
     * Only non-null fields from {@code updatedFields} are applied to the
     * existing step so that callers may send sparse patch payloads, including
     * {@code progress} — omitting it from the request body leaves the current
     * value untouched.
     *
     * The full read-modify-write sequence executes atomically inside
     * ConcurrentHashMap#compute.
     *
     * @param workflowId    id of the parent workflow
     * @param stepId        id of the step to update
     * @param updatedFields carrier object containing the fields to patch
     * @return the updated workflow
     * @throws ResponseStatusException HTTP 404 if the workflow or step is not found
     */
    public Workflow updateStep(String workflowId, String stepId, WorkflowStep updatedFields) {
        Workflow result = repository.compute(workflowId, (key, existing) -> {
            if (existing == null) {
                return null;
            }

            WorkflowStep step = findStep(existing, stepId);
            if (step == null) {
                // Returning the unmodified workflow signals "step not found" to the
                // outer scope via a secondary check. We cannot throw inside compute
                // because lambdas may not propagate checked exceptions, and throwing
                // an unchecked here would corrupt the map entry's lock state on some
                // JVM implementations. Instead we leave the workflow unchanged and
                // detect the miss after the compute returns.
                return existing;
            }

            if (updatedFields.getTitle() != null) {
                step.setTitle(updatedFields.getTitle());
            }
            if (updatedFields.getDescription() != null) {
                step.setDescription(updatedFields.getDescription());
            }
            if (updatedFields.getAssignee() != null) {
                step.setAssignee(updatedFields.getAssignee());
            }
            if (updatedFields.getTargetStartDate() != null) {
                step.setTargetStartDate(updatedFields.getTargetStartDate());
            }
            if (updatedFields.getTargetEndDate() != null) {
                step.setTargetEndDate(updatedFields.getTargetEndDate());
            }
            if (updatedFields.getActualStartDate() != null) {
                step.setActualStartDate(updatedFields.getActualStartDate());
            }
            if (updatedFields.getActualEndDate() != null) {
                step.setActualEndDate(updatedFields.getActualEndDate());
            }
            if (updatedFields.getProgress() != null) {
                step.setProgress(updatedFields.getProgress());
            }

            return existing;
        });

        if (result == null) {
            logger.warn("Workflow not found for step update: workflowId={}, stepId={}", workflowId, stepId);
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Workflow not found: " + workflowId);
        }

        // Verify the step was actually found and mutated
        WorkflowStep updatedStep = findStep(result, stepId);
        if (updatedStep == null) {
            logger.warn("Step not found: stepId={}, workflowId={}", stepId, workflowId);
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Step not found: " + stepId + " in workflow: " + workflowId);
        }

        logger.debug("Step updated: stepId={}, workflowId={}", stepId, workflowId);
        return result;
    }

    // -------------------------------------------------------------------------
    // Comment operations
    // -------------------------------------------------------------------------

    /**
     * Appends a new comment to the specified step.
     *
     * @param workflowId id of the parent workflow
     * @param stepId     id of the target step
     * @param text       comment body text
     * @param author     display name of the commenter
     * @return the updated workflow
     * @throws ResponseStatusException HTTP 404 if the workflow or step is not found
     */
    public Workflow addComment(String workflowId, String stepId, String text, String author) {
        // Build the comment outside the compute lambda to keep the critical section short.
        Comment comment = Comment.builder()
                .id(UUID.randomUUID().toString())
                .text(text)
                .author(author)
                .createdAt(LocalDateTime.now())
                .build();

        Workflow result = repository.compute(workflowId, (key, existing) -> {
            if (existing == null) {
                return null;
            }

            WorkflowStep step = findStep(existing, stepId);
            if (step == null) {
                return existing; // step-not-found sentinel; handled below
            }

            step.getComments().add(comment);
            return existing;
        });

        if (result == null) {
            logger.warn("Workflow not found for comment addition: workflowId={}, stepId={}", workflowId, stepId);
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Workflow not found: " + workflowId);
        }

        WorkflowStep step = findStep(result, stepId);
        if (step == null) {
            logger.warn("Step not found for comment addition: stepId={}, workflowId={}", stepId, workflowId);
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Step not found: " + stepId + " in workflow: " + workflowId);
        }

        logger.debug("Comment added: commentId={}, stepId={}, workflowId={}",
                comment.getId(), stepId, workflowId);
        return result;
    }

    /**
     * Removes a comment from the specified step.
     *
     * @param workflowId id of the parent workflow
     * @param stepId     id of the step containing the comment
     * @param commentId  id of the comment to remove
     * @return the updated workflow
     * @throws ResponseStatusException HTTP 404 if the workflow or step is not found
     */
    public Workflow deleteComment(String workflowId, String stepId, String commentId) {
        Workflow result = repository.compute(workflowId, (key, existing) -> {
            if (existing == null) {
                return null;
            }

            WorkflowStep step = findStep(existing, stepId);
            if (step == null) {
                return existing; // step-not-found sentinel; handled below
            }

            step.getComments().removeIf(c -> commentId.equals(c.getId()));
            return existing;
        });

        if (result == null) {
            logger.warn("Workflow not found for comment deletion: workflowId={}, stepId={}, commentId={}",
                    workflowId, stepId, commentId);
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Workflow not found: " + workflowId);
        }

        WorkflowStep step = findStep(result, stepId);
        if (step == null) {
            logger.warn("Step not found for comment deletion: stepId={}, workflowId={}, commentId={}",
                    stepId, workflowId, commentId);
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Step not found: " + stepId + " in workflow: " + workflowId);
        }

        logger.debug("Comment deleted: commentId={}, stepId={}, workflowId={}",
                commentId, stepId, workflowId);
        return result;
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    /**
     * Finds a step within the workflow's step list by step id.
     * Handles null safety by validating workflow and step list before streaming.
     *
     * @return the matching {@link WorkflowStep}, or {@code null} if not present
     */
    private WorkflowStep findStep(Workflow workflow, String stepId) {
        if (workflow == null || workflow.getSteps() == null || stepId == null) {
            return null;
        }
        return workflow.getSteps().stream()
                .filter(s -> stepId.equals(s.getId()))
                .findFirst()
                .orElse(null);
    }

    /**
     * Produces a human-readable default title for a step based on its type.
     * This gives freshly created workflows meaningful step names out of the box.
     */
    private String formatDefaultTitle(StepType type) {
        if (type == null) {
            return "";
        }
        String raw = type.name();
        if (raw == null || raw.isEmpty()) {
            return "";
        }
        return raw.charAt(0) + raw.substring(1).toLowerCase();
    }
}
