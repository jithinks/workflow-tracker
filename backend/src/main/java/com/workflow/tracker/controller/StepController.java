package com.workflow.tracker.controller;

import com.workflow.tracker.model.Workflow;
import com.workflow.tracker.model.WorkflowStep;
import com.workflow.tracker.service.WorkflowService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

/**
 * REST controller for step and comment operations within a workflow.
 *
 * <p>All routes are nested under /api/workflows/{workflowId}/steps so that
 * the parent workflow is always identified in the path. Every mutating
 * operation returns the full, up-to-date {@link Workflow} object so the
 * client never needs a follow-up GET to refresh its state.
 */
@RestController
@RequestMapping("/api/workflows/{workflowId}/steps")
@RequiredArgsConstructor
public class StepController {

    private final WorkflowService workflowService;

    // -------------------------------------------------------------------------
    // Request DTOs
    // -------------------------------------------------------------------------

    /**
     * Partial-update payload for a workflow step.
     *
     * <p>Every field is optional (nullable). The service merges only non-null
     * String and LocalDate fields, so a client can patch a single field without
     * resetting the others.
     *
     * <p><strong>progress semantics:</strong> When omitted from the JSON body,
     * Jackson leaves this field as {@code null}, and {@link #toWorkflowStep()}
     * passes it through as {@code null}. The service skips the progress update
     * entirely when it receives {@code null}, so clients may omit the field
     * when not intending to change the current progress value.
     *
     * <p>Date fields use {@link LocalDate} (ISO-8601 format: YYYY-MM-DD).
     * Jackson deserialises them automatically because
     * {@code write-dates-as-timestamps} is disabled in application.yml and the
     * JavaTimeModule is auto-configured by Spring Boot.
     */
    record UpdateStepRequest(
            String title,
            String description,
            String assignee,
            LocalDate targetStartDate,
            LocalDate targetEndDate,
            LocalDate actualStartDate,
            LocalDate actualEndDate,
            Integer progress
    ) {
        /**
         * Maps this request onto a {@link WorkflowStep} carrier for the service layer.
         *
         * <p>{@code progress} defaults to {@code 0} when absent from the request body,
         * consistent with the service's "always apply primitive progress" contract.
         */
        WorkflowStep toWorkflowStep() {
            return WorkflowStep.builder()
                    .title(title)
                    .description(description)
                    .assignee(assignee)
                    .targetStartDate(targetStartDate)
                    .targetEndDate(targetEndDate)
                    .actualStartDate(actualStartDate)
                    .actualEndDate(actualEndDate)
                    .progress(progress)
                    .build();
        }
    }

    /**
     * Payload for adding a comment to a step.
     *
     * <p>Both {@code text} and {@code author} are required — a comment with no
     * content or no attribution is rejected before the handler runs.
     */
    record AddCommentRequest(
            @NotBlank(message = "text must not be blank") String text,
            @NotBlank(message = "author must not be blank") String author
    ) {}

    // -------------------------------------------------------------------------
    // Endpoints
    // -------------------------------------------------------------------------

    /**
     * Partially updates a workflow step.
     *
     * <p>PUT /api/workflows/{workflowId}/steps/{stepId}
     *
     * <p>Only the fields present in the request body (non-null) are applied.
     * The {@link WorkflowStep} passed to the service is built from the request
     * record; the service layer is responsible for the actual merge logic.
     *
     * @return the updated parent {@link Workflow}
     */
    @PutMapping("/{stepId}")
    public ResponseEntity<Workflow> updateStep(
            @PathVariable String workflowId,
            @PathVariable String stepId,
            @RequestBody UpdateStepRequest request) {

        Workflow updated = workflowService.updateStep(workflowId, stepId, request.toWorkflowStep());
        return ResponseEntity.ok(updated);
    }

    /**
     * Appends a comment to a workflow step.
     *
     * <p>POST /api/workflows/{workflowId}/steps/{stepId}/comments
     *
     * @return the updated parent {@link Workflow}
     */
    @PostMapping("/{stepId}/comments")
    public ResponseEntity<Workflow> addComment(
            @PathVariable String workflowId,
            @PathVariable String stepId,
            @Valid @RequestBody AddCommentRequest request) {

        Workflow updated = workflowService.addComment(
                workflowId, stepId, request.text(), request.author());
        return ResponseEntity.ok(updated);
    }

    /**
     * Removes a specific comment from a workflow step.
     *
     * <p>DELETE /api/workflows/{workflowId}/steps/{stepId}/comments/{commentId}
     *
     * @return the updated parent {@link Workflow} (comment list reflects the deletion)
     */
    @DeleteMapping("/{stepId}/comments/{commentId}")
    public ResponseEntity<Workflow> deleteComment(
            @PathVariable String workflowId,
            @PathVariable String stepId,
            @PathVariable String commentId) {

        Workflow updated = workflowService.deleteComment(workflowId, stepId, commentId);
        return ResponseEntity.ok(updated);
    }
}
