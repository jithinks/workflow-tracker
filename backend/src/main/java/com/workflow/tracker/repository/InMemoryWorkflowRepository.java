package com.workflow.tracker.repository;

import com.workflow.tracker.model.Workflow;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Thread-safe in-memory repository backed by a ConcurrentHashMap.
 *
 * ConcurrentHashMap provides safe concurrent reads and segment-level locking for
 * individual put/remove operations. Callers that need compound atomicity (read-then-
 * write) must use the compute-family methods exposed here rather than combining
 * findById + save externally.
 */
@Repository
public class InMemoryWorkflowRepository {

    private final ConcurrentHashMap<String, Workflow> store = new ConcurrentHashMap<>();

    /**
     * Returns a snapshot list of all stored workflows.
     * Safe under concurrent modification because ConcurrentHashMap iterators
     * reflect the state at the time of iteration without throwing
     * ConcurrentModificationException.
     */
    public List<Workflow> findAll() {
        return new ArrayList<>(store.values());
    }

    /**
     * Looks up a workflow by its string UUID key.
     *
     * @param id the workflow identifier
     * @return an Optional containing the workflow if found, or empty otherwise
     */
    public Optional<Workflow> findById(String id) {
        return Optional.ofNullable(store.get(id));
    }

    /**
     * Persists (inserts or replaces) a workflow using its id as the map key.
     *
     * @param workflow the workflow to store; must have a non-null id
     * @return the same workflow instance that was stored
     */
    public Workflow save(Workflow workflow) {
        store.put(workflow.getId(), workflow);
        return workflow;
    }

    /**
     * Removes a workflow from the store. No-op if the id is not present.
     *
     * @param id the workflow identifier to remove
     */
    public void deleteById(String id) {
        store.remove(id);
    }

    /**
     * Checks whether a workflow with the given id currently exists in the store.
     *
     * @param id the workflow identifier
     * @return true if present, false otherwise
     */
    public boolean existsById(String id) {
        return store.containsKey(id);
    }

    /**
     * Atomically applies a mapping function to the workflow identified by id.
     * This method delegates to {@link ConcurrentHashMap#compute} so the function
     * executes under a striped lock — no other thread can modify the same key
     * concurrently. Use this for any read-modify-write sequence that must be atomic.
     *
     * @param id             the workflow identifier
     * @param remappingFunction receives (key, currentValue) — currentValue may be null
     *                         if the key is absent; returning null removes the entry
     * @return the new value as returned by the function, or null if removed
     */
    public Workflow compute(String id,
            java.util.function.BiFunction<String, Workflow, Workflow> remappingFunction) {
        return store.compute(id, remappingFunction);
    }
}
