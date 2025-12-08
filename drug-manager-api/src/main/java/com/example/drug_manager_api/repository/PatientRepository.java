package com.example.drug_manager_api.repository;

import com.example.drug_manager_api.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
	Optional<Patient> findByTenBenhNhanIgnoreCase(String tenBenhNhan);
	Optional<Patient> findByLinkedUserId(Long linkedUserId);
}
