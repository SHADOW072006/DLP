package com.intellidlp.discovery;

import com.intellidlp.classification.ClassificationLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ScannedFileRepository extends JpaRepository<ScannedFile, UUID> {
    Optional<ScannedFile> findBySha256Hash(String sha256Hash);
    Page<ScannedFile> findByClassificationLevel(ClassificationLevel classificationLevel, Pageable pageable);
    long countByClassificationLevel(ClassificationLevel classificationLevel);
}

