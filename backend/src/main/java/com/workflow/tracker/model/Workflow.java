package com.workflow.tracker.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Workflow {

    /**
     * Unique identifier for this workflow, assigned as a UUID string on creation.
     */
    private String id;

    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    private LocalDateTime createdAt;

    /**
     * Ordered list of workflow steps.
     * Initialized to an empty list; steps are auto-generated on workflow creation.
     * The @Builder.Default annotation ensures the builder also uses this initializer.
     */
    @Builder.Default
    private List<WorkflowStep> steps = new ArrayList<>();

    // Explicit setters for mutable fields only
    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setSteps(List<WorkflowStep> steps) {
        this.steps = steps;
    }
}
