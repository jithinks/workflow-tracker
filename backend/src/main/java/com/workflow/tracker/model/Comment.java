package com.workflow.tracker.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@Getter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Comment {

    /**
     * Unique identifier for this comment, assigned as a UUID string on creation.
     */
    private String id;

    @Size(max = 2000, message = "Comment text must not exceed 2000 characters")
    private String text;

    @Size(max = 255, message = "Author name must not exceed 255 characters")
    private String author;

    private LocalDateTime createdAt;
}
