package com.workflow.tracker.controller;

import com.workflow.tracker.model.Workflow;
import com.workflow.tracker.service.WorkflowService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller for Workflow CRUD operations.
 *
 * <p>All routes are mounted under /api/workflows. Request/response DTOs are
 * defined as Java 17 records nested inside this controller to keep the API
 * contract co-located with the handler code.
 */
@RestController
@RequestMapping("/api/workflows")
@RequiredArgsConstructor
public class WorkflowController {

    private final WorkflowService workflowService;

    // -------------------------------------------------------------------------
    // Request DTOs
    // -------------------------------------------------------------------------

    /**
     * Payload for creating a new workflow. Both fields are required — a blank
     * name or description is a client error and will be rejected by Bean Validation
     * before the handler is invoked.
     */
    record CreateWorkflowRequest(
            @NotBlank(message = "name must not be blank") String name,
            @NotBlank(message = "description must not be blank") String description
    ) {}

    /**
     * Payload for renaming / re-describing an existing workflow. Both fields
     * are required for a full replacement; partial updates are not supported
     * at the workflow level (use the step endpoint for per-field updates).
     */
    record UpdateWorkflowRequest(
            @NotBlank(message = "name must not be blank") String name,
            @NotBlank(message = "description must not be blank") String description
    ) {}

    // -------------------------------------------------------------------------
    // Endpoints
    // -------------------------------------------------------------------------

    /**
     * Returns every workflow stored in the system.
     *
     * <p>GET /api/workflows
     */
    @GetMapping
    public ResponseEntity<List<Workflow>> getAllWorkflows() {
        return ResponseEntity.ok(workflowService.getAllWorkflows());
    }

    /**
     * Returns a single workflow by its identifier.
     *
     * <p>GET /api/workflows/{id}
     *
     * @throws com.workflow.tracker.exception.WorkflowNotFoundException when the id does not match any stored workflow
     */
    @GetMapping("/{id}")
    public ResponseEntity<Workflow> getWorkflow(@PathVariable String id) {
        return ResponseEntity.ok(workflowService.getWorkflow(id));
    }

    /**
     * Creates a new workflow and returns it with HTTP 201 Created.
     *
     * <p>POST /api/workflows
     */
    @PostMapping
    public ResponseEntity<Workflow> createWorkflow(
            @Valid @RequestBody CreateWorkflowRequest request) {
        Workflow created = workflowService.createWorkflow(request.name(), request.description());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Replaces the name and description of an existing workflow.
     *
     * <p>PUT /api/workflows/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Workflow> updateWorkflow(
            @PathVariable String id,
            @Valid @RequestBody UpdateWorkflowRequest request) {
        Workflow updated = workflowService.updateWorkflow(id, request.name(), request.description());
        return ResponseEntity.ok(updated);
    }

    /**
     * Permanently removes a workflow and all of its steps and comments.
     *
     * <p>DELETE /api/workflows/{id}
     *
     * @return 204 No Content on success
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkflow(@PathVariable String id) {
        workflowService.deleteWorkflow(id);
        return ResponseEntity.noContent().build();
    }
}
