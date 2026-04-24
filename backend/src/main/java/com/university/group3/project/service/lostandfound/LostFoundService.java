package com.university.group3.project.service.lostandfound;

import com.university.group3.project.dtos.lostandfound.FoundItemDTO;
import com.university.group3.project.dtos.lostandfound.LostItemDTO;
import com.university.group3.project.entities.User;
import com.university.group3.project.entities.lostandfound.FoundItem;
import com.university.group3.project.entities.lostandfound.LostItem;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface LostFoundService {

    FoundItem createFound(FoundItemDTO dto, MultipartFile image, User user);
    FoundItem updateFound(Long id, FoundItemDTO dto, MultipartFile image, User user);
    void deleteFound(Long id, User user);

    LostItem createLost(LostItemDTO dto, MultipartFile image, User user);
    LostItem updateLost(Long id, LostItemDTO dto, MultipartFile image, User user);
    void deleteLost(Long id, User user);

    List<FoundItem> getAllFound();
    List<LostItem> getAllLost();

    List<FoundItem> getMyFound(User user);
    List<LostItem> getMyLost(User user);

    List<FoundItem> suggest(String itemName);

    FoundItem getFoundById(Long id);
    LostItem getLostById(Long id);
}
