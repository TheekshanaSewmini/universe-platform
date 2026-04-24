package com.university.group3.project.repos.materials;

import com.university.group3.project.entities.materials.Material;
import com.university.group3.project.entities.materials.MaterialVersion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MaterialVersionRepository extends JpaRepository<MaterialVersion, Long> {
    List<MaterialVersion> findByMaterialOrderByVersionNumberDesc(Material material);
    MaterialVersion findTopByMaterialOrderByVersionNumberDesc(Material material);
    void deleteByMaterial(Material material);

}
