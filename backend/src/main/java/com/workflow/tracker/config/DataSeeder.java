package com.workflow.tracker.config;

import com.workflow.tracker.model.Workflow;
import com.workflow.tracker.model.WorkflowStep;
import com.workflow.tracker.service.WorkflowService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Seeds the in-memory store with a representative sample workflow on startup.
 *
 * <p>This seeder runs once on every application start. It is intentionally
 * kept simple — no idempotency guard is needed because the underlying store
 * is reset each time the JVM starts. If the store is ever made persistent,
 * add an existence check before calling createWorkflow().
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final WorkflowService workflowService;

    @Override
    public void run(String... args) {
        log.info("DataSeeder: seeding sample workflow...");

        Workflow workflow = workflowService.createWorkflow(
                "Sample Workflow",
                "A pre-seeded sample workflow demonstrating all five steps"
        );

        String workflowId = workflow.getId();
        // The service guarantees that a freshly created workflow contains exactly
        // five steps ordered by StepType ordinal. We retrieve their IDs positionally.
        String requirementId   = workflow.getSteps().get(0).getId();
        String architectureId  = workflow.getSteps().get(1).getId();
        String designId        = workflow.getSteps().get(2).getId();
        String developmentId   = workflow.getSteps().get(3).getId();
        String implementationId = workflow.getSteps().get(4).getId();

        workflowService.updateStep(workflowId, requirementId,
                WorkflowStep.builder()
                        .title("Define Requirements")
                        .description("Gather and document all project requirements")
                        .assignee("Alice")
                        .progress(100)
                        .build());

        workflowService.updateStep(workflowId, architectureId,
                WorkflowStep.builder()
                        .title("Design Architecture")
                        .description("Create system architecture and tech stack decisions")
                        .assignee("Bob")
                        .progress(75)
                        .build());

        workflowService.updateStep(workflowId, designId,
                WorkflowStep.builder()
                        .title("UI/UX Design")
                        .description("Create wireframes and visual designs")
                        .assignee("Carol")
                        .progress(50)
                        .build());

        workflowService.updateStep(workflowId, developmentId,
                WorkflowStep.builder()
                        .title("Core Development")
                        .description("Implement backend and frontend features")
                        .assignee("Dave")
                        .progress(25)
                        .build());

        workflowService.updateStep(workflowId, implementationId,
                WorkflowStep.builder()
                        .title("Deploy & Launch")
                        .description("Deploy to production and monitor launch")
                        .assignee("Eve")
                        .progress(0)
                        .build());

        log.info("DataSeeder: sample workflow '{}' created with id={}",
                workflow.getName(), workflowId);
    }
}
