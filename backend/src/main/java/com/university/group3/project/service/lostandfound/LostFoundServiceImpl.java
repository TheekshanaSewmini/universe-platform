package com.university.group3.project.service.lostandfound;


import com.university.group3.project.dtos.lostandfound.FoundItemDTO;
import com.university.group3.project.dtos.lostandfound.LostItemDTO;
import com.university.group3.project.entities.User;
import com.university.group3.project.entities.lostandfound.FoundItem;
import com.university.group3.project.entities.lostandfound.LostItem;
import com.university.group3.project.repos.lostandfound.FoundItemRepository;
import com.university.group3.project.repos.lostandfound.LostItemRepository;
import com.university.group3.project.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LostFoundServiceImpl implements LostFoundService {

    private final FoundItemRepository foundRepo;
    private final LostItemRepository lostRepo;
    private final FileStorageService fileStorageService;

    private String saveImage(MultipartFile file) {
        return fileStorageService.storeImage(file).url();
    }

    // FOUND

    @Override
    public FoundItem createFound(FoundItemDTO dto, MultipartFile image, User user) {
        return foundRepo.save(FoundItem.builder()
                .itemName(dto.getItemName())
                .description(dto.getDescription())
                .foundPlace(dto.getFoundPlace())
                .publisherName(dto.getPublisherName())
                .contactPhone(dto.getContactPhone())
                .foundDate(dto.getFoundDate())
                .year(dto.getYear())
                .semester(dto.getSemester())
                .imageUrl(saveImage(image))
                .user(user)
                .createdAt(new Date())
                .build());
    }

    @Override
    public FoundItem updateFound(Long id, FoundItemDTO dto, MultipartFile image, User user) {

        FoundItem item = foundRepo.findById(id).orElseThrow();

        if (!item.getUser().getUserId().equals(user.getUserId()))
            throw new RuntimeException("Unauthorized");

        if (image != null && !image.isEmpty())
            item.setImageUrl(saveImage(image));

        item.setItemName(dto.getItemName());
        item.setDescription(dto.getDescription());
        item.setFoundPlace(dto.getFoundPlace());
        item.setPublisherName(dto.getPublisherName());
        item.setContactPhone(dto.getContactPhone());
        item.setFoundDate(dto.getFoundDate());
        item.setYear(dto.getYear());
        item.setSemester(dto.getSemester());

        return foundRepo.save(item);
    }

    @Override
    public void deleteFound(Long id, User user) {
        FoundItem item = foundRepo.findById(id).orElseThrow();

        if (!item.getUser().getUserId().equals(user.getUserId()))
            throw new RuntimeException("Unauthorized");

        foundRepo.delete(item);
    }

    //  LOST

    @Override
    public LostItem createLost(LostItemDTO dto, MultipartFile image, User user) {
        return lostRepo.save(LostItem.builder()
                .itemName(dto.getItemName())
                .description(dto.getDescription())
                .lostPlace(dto.getLostPlace())
                .contactName(dto.getContactName())
                .contactPhone(dto.getContactPhone())
                .lostDate(dto.getLostDate())
                .year(dto.getYear())
                .semester(dto.getSemester())
                .imageUrl(saveImage(image))
                .user(user)
                .createdAt(new Date())
                .build());
    }

    @Override
    public LostItem updateLost(Long id, LostItemDTO dto, MultipartFile image, User user) {

        LostItem item = lostRepo.findById(id).orElseThrow();

        if (!item.getUser().getUserId().equals(user.getUserId()))
            throw new RuntimeException("Unauthorized");

        if (image != null && !image.isEmpty())
            item.setImageUrl(saveImage(image));

        item.setItemName(dto.getItemName());
        item.setDescription(dto.getDescription());
        item.setLostPlace(dto.getLostPlace());
        item.setContactName(dto.getContactName());
        item.setContactPhone(dto.getContactPhone());
        item.setLostDate(dto.getLostDate());
        item.setYear(dto.getYear());
        item.setSemester(dto.getSemester());

        return lostRepo.save(item);
    }

    @Override
    public void deleteLost(Long id, User user) {
        LostItem item = lostRepo.findById(id).orElseThrow();

        if (!item.getUser().getUserId().equals(user.getUserId()))
            throw new RuntimeException("Unauthorized");

        lostRepo.delete(item);
    }


    //  LOst and found get

    @Override
    public List<FoundItem> getAllFound() {
        return foundRepo.findAll();
    }

    @Override
    public List<LostItem> getAllLost() {
        return lostRepo.findAll();
    }

    @Override
    public List<FoundItem> getMyFound(User user) {
        return foundRepo.findByUser(user);
    }

    @Override
    public List<LostItem> getMyLost(User user) {
        return lostRepo.findByUser(user);
    }

    @Override
    public FoundItem getFoundById(Long id) {
        return foundRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Found item not found"));
    }
    @Override
    public LostItem getLostById(Long id) {
        return lostRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Lost item not found"));
    }

    @Override
    public List<FoundItem> suggest(String itemName) {
        return foundRepo.findByItemNameContainingIgnoreCase(itemName);
    }
}
