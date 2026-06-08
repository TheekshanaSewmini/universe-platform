package com.university.group3.project.repos.lostandfound;

import com.university.group3.project.entities.User;
import com.university.group3.project.entities.lostandfound.FoundItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FoundItemRepository extends JpaRepository<FoundItem, Long> {
    List<FoundItem> findByUser(User user);
    List<FoundItem> findByItemNameContainingIgnoreCase(String itemName);
}
