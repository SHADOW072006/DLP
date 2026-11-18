package com.intellidlp.redaction;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RedactionRecordRepository extends JpaRepository<RedactionRecord, UUID> {
    List<RedactionRecord> findByOriginalFileId(UUID originalFileId);
}

