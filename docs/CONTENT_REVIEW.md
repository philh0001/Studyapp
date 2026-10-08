# Content review

Every supplied question is an original draft based on retrieved official Microsoft Learn documentation. A successful URL check alone is not a correctness review.

Review each revision's scenario assumptions, correct answer, every distractor explanation, and linked source sections. Verify licences/SKUs and configuration conditions where relevant. Approve only when the cited documentation supports an unambiguous answer. Request correction if it does not. Approval is explicit, stored locally, and specific to the question ID/revision. Imported ownership/reviewer fields cannot activate content.

The starter pack remains draft in Git. The app's Content Review screen records local human approval and promotes an installed question to reviewed. No personal review identity is committed. Corrections invalidate old eligibility while preserving attempts. Notes are personal annotations, not verified learning facts.

Sources were fetched from Microsoft Learn at the dates recorded in content/sources/microsoft-source-checks.json; hashes identify the retrieved pages. Check official sources again before pack release. A 30-day reminder asks for rechecking but does not pretend an automatic correctness review occurred. Temporary source outages do not prove an answer is wrong.

## Proposed starter draft pack — 8 October 2026

The proposed pack contains 50 original AI-assisted questions, ten per domain, mapped to the blueprint effective 17 April 2026. Every revision remains `draft` with `review: null`. Two questions per domain are assessment-reserved (IDs ending `09` and `10`); approval alone does not release that holdout. Five questions use explicit choose-two selection. The [initial five-question review batch](reference/first-five-draft-questions.md) contains one question per domain, including a multiple-select example and an NSG troubleshooting scenario, with every answer explanation and source-check date.

Canonical Learn pages were actually retrieved on 8 October 2026, as recorded in the existing source ledger. Each question names the relevant section and records claim evidence, all option references, the retrieval timestamp, and the publisher update date visible in the retrieved text. Section fields are section titles rather than unverified fragment URLs. These are technical drafts proposed for human review: structural validation, canonical-host verification and page retrieval cannot establish full factual acceptance or Microsoft endorsement. No generated reviewer identity activates these questions.

| Domain | Objective question counts | Explicit objective gaps |
| --- | --- | --- |
| Identities and governance | `rbac`: 5; `governance`: 5 | `entra`: no questions. Governance is limited to policy concepts and locks; tags, costs/budgets/Advisor, resource-group/subscription operations and management-group configuration remain gaps. |
| Storage | `storage-accounts`: 4; `storage-access`: 3; `blobs-files`: 3 | These are partial objectives: redundancy, SAS and block-blob tiers only. Storage firewalls, key management, Azure Files identity access, object replication, encryption, Explorer/AzCopy, file shares, soft delete, snapshots, lifecycle configuration and versioning need further questions. |
| Compute | `vms`: 4; `app-service`: 3; `containers`: 3 | `arm-bicep`: no questions. VM coverage is availability sets only; Container Apps coverage is scaling only; App Service coverage is slots only. VM creation/disks/encryption/moves/sizes/scale sets/zones, ACR/ACI, App Service scaling/networking/TLS/DNS/backups remain gaps. |
| Networking | `vnets`: 3; `network-security`: 7 | `dns-balancing`: no questions. Coverage is limited to peering, NSG rules/ASG concepts and private endpoints. VNet/subnet creation, public IPs, route configuration, Bastion and service endpoints need further questions. |
| Monitoring and maintenance | `monitor`: 6; `backup-recovery`: 4 | Monitoring covers alert concepts and log-query tools only; metrics interpretation, log collection/settings, Insights, Network Watcher and Connection Monitor remain gaps. Backup covers Azure VM backup concepts only; vault/policy configuration, hands-on restore, Site Recovery/failover and backup reporting remain gaps. |

These counts are question distribution, not comprehensive objective coverage or pass-readiness evidence. The 50 drafts support an initial review queue; normal study remains unavailable until explicit local human approvals establish eligible content. All 50 require approval for the full proposed release bank, with reserved questions separately excluded from ordinary learning.

Source caveats for reviewers: the retrieved Container Apps page has an example whose `minReplicas`/`maxReplicas` values conflict with its prose; these drafts cite the clear textual scaling rules and avoid that snippet and numeric limits. The SAS page now describes expanded user-delegation service support; these drafts ask only about authorization method and stored-access-policy limitations, avoiding uncertain service-availability generalizations. Recheck documentation and conditions before release.
