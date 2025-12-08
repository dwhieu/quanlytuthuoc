package com.example.drug_manager_api.repository;

import com.example.drug_manager_api.model.Drug;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DrugRepository extends JpaRepository<Drug, Long> {
	boolean existsByTenThuocIgnoreCase(String tenThuoc);
}
