package com.intellidlp.policy;

import com.intellidlp.common.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class PolicyService {

    private final DlpPolicyRepository dlpPolicyRepository;

    public PolicyService(DlpPolicyRepository dlpPolicyRepository) {
        this.dlpPolicyRepository = dlpPolicyRepository;
    }

    @Transactional(readOnly = true)
    public List<DlpPolicy> getAllPolicies() {
        return dlpPolicyRepository.findAll();
    }

    @Transactional(readOnly = true)
    public DlpPolicy getPolicyById(UUID id) {
        return dlpPolicyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found: " + id));
    }

    @Transactional
    public DlpPolicy createPolicy(CreatePolicyRequest req) {
        DlpPolicy policy = new DlpPolicy();
        policy.setName(req.getName());
        policy.setDescription(req.getDescription());
        policy.setTargetClassification(req.getTargetClassification());
        policy.setDetectionCategory(req.getDetectionCategory());
        policy.setAction(req.getAction() != null ? req.getAction() : PolicyAction.WARN);
        policy.setSimulationMode(req.isSimulationMode());
        policy.setSeverity(req.getSeverity() != null ? req.getSeverity() : PolicySeverity.MEDIUM);
        policy.setActive(req.isActive());
        return dlpPolicyRepository.save(policy);
    }

    @Transactional
    public DlpPolicy updatePolicy(UUID id, CreatePolicyRequest req) {
        DlpPolicy policy = getPolicyById(id);
        policy.setName(req.getName());
        policy.setDescription(req.getDescription());
        policy.setTargetClassification(req.getTargetClassification());
        policy.setDetectionCategory(req.getDetectionCategory());
        if (req.getAction() != null) {
            policy.setAction(req.getAction());
        }
        policy.setSimulationMode(req.isSimulationMode());
        if (req.getSeverity() != null) {
            policy.setSeverity(req.getSeverity());
        }
        policy.setActive(req.isActive());
        return dlpPolicyRepository.save(policy);
    }

    @Transactional
    public void deletePolicy(UUID id) {
        DlpPolicy policy = getPolicyById(id);
        dlpPolicyRepository.delete(policy);
    }

    @Transactional
    public DlpPolicy toggleSimulationMode(UUID id) {
        DlpPolicy policy = getPolicyById(id);
        policy.setSimulationMode(!policy.isSimulationMode());
        return dlpPolicyRepository.save(policy);
    }
}
