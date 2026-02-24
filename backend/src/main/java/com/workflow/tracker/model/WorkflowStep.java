package com.workflow.tracker.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowStep {

    /**
     * Unique identifier for this step, assigned as a UUID string on creation.
     */
    private String id;

    private StepType type;

    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @Size(max = 255, message = "Assignee must not exceed 255 characters")
    private String assignee;

    private LocalDate targetStartDate;

    private LocalDate targetEndDate;

    private LocalDate actualStartDate;

    private LocalDate actualEndDate;

    /**
     * Completion percentage, valid range 0–100.
     * Changed from int to Integer to support partial updates without data loss.
     */
    @Min(value = 0, message = "Progress must be at least 0")
    @Max(value = 100, message = "Progress must not exceed 100")
    private Integer progress;

    /**
     * Initialized to an empty list to avoid null-checks throughout the service layer.
     * The @Builder.Default annotation ensures the builder also uses this initializer.
     */
    @Builder.Default
    private List<Comment> comments = new ArrayList<>();

    // Explicit setters for mutable fields only
    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setAssignee(String assignee) {
        this.assignee = assignee;
    }

    public void setTargetStartDate(LocalDate targetStartDate) {
        this.targetStartDate = targetStartDate;
    }

    public void setTargetEndDate(LocalDate targetEndDate) {
        this.targetEndDate = targetEndDate;
    }

    public void setActualStartDate(LocalDate actualStartDate) {
        this.actualStartDate = actualStartDate;
    }

    public void setActualEndDate(LocalDate actualEndDate) {
        this.actualEndDate = actualEndDate;
    }

    public void setProgress(Integer progress) {
        this.progress = progress;
    }

    public void setComments(List<Comment> comments) {
        this.comments = comments;
    }
}
