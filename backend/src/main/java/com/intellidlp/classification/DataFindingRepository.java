package com.intellidlp.classification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Repository
public interface DataFindingRepository extends JpaRepository<DataFinding, UUID> {
    List<DataFinding> findByScannedFileId(UUID scannedFileId);
    long countByFindingType(String findingType);

    @Query("SELECT df.findingType AS findingType, COUNT(df) AS count FROM DataFinding df GROUP BY df.findingType")
    List<Map<String, Object>> countGroupedByFindingType();
}

