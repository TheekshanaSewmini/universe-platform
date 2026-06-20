package com.university.group3.project.repos.lostandfound;

import com.university.group3.project.entities.User;
import com.university.group3.project.entities.lostandfound.LostItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LostItemRepository extends JpaRepository<LostItem, Long> {
    List<LostItem> findByUser(User user);
}
