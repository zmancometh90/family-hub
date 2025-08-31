package com.github.zmancometh90.familyhub.repository;

import com.github.zmancometh90.familyhub.models.Chore;
import com.github.zmancometh90.familyhub.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ChoreRepository extends JpaRepository<Chore, UUID> {

    List<Chore> findByAssignedTo(User assignedTo);

    List<Chore> findByCreatedBy(User createdBy);

    List<Chore> findByStatus(Chore.ChoreStatus status);

    List<Chore> findByAssignedToAndStatus(User assignedTo, Chore.ChoreStatus status);

    @Query("SELECT c FROM Chore c WHERE c.dueDate BETWEEN :startDate AND :endDate")
    List<Chore> findByDueDateBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT c FROM Chore c WHERE c.assignedTo = :assignedTo AND c.dueDate BETWEEN :startDate AND :endDate")
    List<Chore> findByAssignedToAndDueDateBetween(@Param("assignedTo") User assignedTo, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT c FROM Chore c WHERE c.dueDate < :currentDate AND c.status != 'COMPLETED' AND c.status != 'CANCELLED'")
    List<Chore> findOverdueChores(@Param("currentDate") LocalDate currentDate);

    List<Chore> findByPriority(Chore.ChorePriority priority);

    List<Chore> findByChoreType(Chore.ChoreType choreType);
}