# First five original draft questions for human review

These AI-assisted revision-1 drafts are proposed for review, one per domain. They are not Microsoft exam questions and have no human approval. Choose **Approve** or **Request correction** in the app only after checking the scenario, answer and every explanation against the cited sections. Source retrieval is evidence gathering, not human technical approval. Reviewing this batch does not approve the other 45 questions.

## az104-identity-01 — identity

Revision: 1; objective: `rbac`; status: draft; reviewer: none.

A team must manage resources only inside the catalog resource group. Other subscription resources are outside its remit. Assume no other role assignments.

At which scope should you assign the required Azure role?

Correct option IDs: **a**

- **a — Resource group**
  Explanation: A resource-group scope limits the role to resources in that resource group and its child resources. Reference IDs: rbac.
- **b — Subscription**
  Explanation: Subscription scope includes the subscription resources, extending access beyond the stated resource group. Reference IDs: rbac.
- **c — Management group**
  Explanation: Management-group scope is above subscription scope in the documented hierarchy, broader than this requirement. Reference IDs: rbac.

Overall explanation: A resource-group scope limits the role to resources in that resource group and its child resources.

Source `rbac`: [What is Azure role-based access control (Azure RBAC)?](https://learn.microsoft.com/en-us/azure/role-based-access-control/overview)
Section: Scope. Retrieved: 2026-10-08T00:48:12.071Z. Document updated: 2024-03-12T00:00:00Z.
Evidence: Retrieved Microsoft Learn section: Scope. Claim evidence: A resource-group scope limits the role to resources in that resource group and its child resources. Subscription scope includes the subscription resources, extending access beyond the stated resource group. Management-group scope is above subscription scope in the documented hierarchy, broader than this requirement.

Review decision: pending. Suggested review note: confirm all assumptions and explain any requested correction.

## az104-storage-05 — storage

Revision: 1; objective: `storage-access`; status: draft; reviewer: none.

A service issues temporary Blob Storage access to partners using a SAS. The security team is comparing SAS authorization methods.

Which TWO statements match the documented SAS types? Choose two.

Correct option IDs: **a, b**

- **a — User delegation SAS uses Microsoft Entra credentials.**
  Explanation: Microsoft describes user delegation SAS as secured with Microsoft Entra credentials rather than the storage account key. Reference IDs: sas.
- **b — Service SAS is secured with the storage account key.**
  Explanation: A service SAS delegates access to a resource in one storage service and is secured with the account key. Reference IDs: sas.
- **c — Account SAS is secured only by Microsoft Entra credentials.**
  Explanation: Account SAS is secured with the storage account key; the Entra-based option is user delegation SAS. Reference IDs: sas.
- **d — Service SAS delegates across multiple storage services.**
  Explanation: A service SAS is restricted to one storage service; account SAS can delegate across one or more services. Reference IDs: sas.

Overall explanation: Microsoft describes user delegation SAS as secured with Microsoft Entra credentials rather than the storage account key. A service SAS delegates access to a resource in one storage service and is secured with the account key.

Source `sas`: [Grant limited access to Azure Storage resources using shared access signatures (SAS)](https://learn.microsoft.com/en-us/azure/storage/common/storage-sas-overview)
Section: Types of shared access signatures. Retrieved: 2026-10-08T00:48:14.466Z. Document updated: 2026-02-27T00:00:00Z.
Evidence: Retrieved Microsoft Learn section: Types of shared access signatures. Claim evidence: Microsoft describes user delegation SAS as secured with Microsoft Entra credentials rather than the storage account key. A service SAS delegates access to a resource in one storage service and is secured with the account key. Account SAS is secured with the storage account key; the Entra-based option is user delegation SAS. A service SAS is restricted to one storage service; account SAS can delegate across one or more services.

Review decision: pending. Suggested review note: confirm all assumptions and explain any requested correction.

## az104-compute-01 — compute

Revision: 1; objective: `app-service`; status: draft; reviewer: none.

A web app runs on a Standard App Service plan. A newly created staging slot cloned production configuration, but developers find no application files in it.

Which documented behavior explains this?

Correct option IDs: **a**

- **a — Cloning slot settings does not clone app content.**
  Explanation: The source states that a new slot has no content even when settings are cloned; application content must be deployed to it. Reference IDs: slots.
- **b — Standard plans cannot use deployment slots.**
  Explanation: Standard is one of the supported tiers for deployment slots, so tier support does not explain missing content. Reference IDs: slots.
- **c — A deployment slot is only a configuration record, never a live app.**
  Explanation: Slots are live apps with their own host names, despite starting without application content. Reference IDs: slots.

Overall explanation: The source states that a new slot has no content even when settings are cloned; application content must be deployed to it.

Source `slots`: [Set up staging environments in Azure App Service](https://learn.microsoft.com/en-us/azure/app-service/deploy-staging-slots)
Section: Add a slot. Retrieved: 2026-10-08T00:48:16.200Z. Document updated: 2025-11-28T00:00:00Z.
Evidence: Retrieved Microsoft Learn section: Add a slot. Claim evidence: The source states that a new slot has no content even when settings are cloned; application content must be deployed to it. Standard is one of the supported tiers for deployment slots, so tier support does not explain missing content. Slots are live apps with their own host names, despite starting without application content.

Review decision: pending. Suggested review note: confirm all assumptions and explain any requested correction.

## az104-networking-01 — networking

Revision: 1; objective: `network-security`; status: draft; reviewer: none.

A new TCP connection matches an NSG deny rule at priority 200 and an allow rule at priority 300. Assume no overriding security admin rule and all other controls permit it.

What does this NSG do?

Correct option IDs: **a**

- **a — Deny the connection.**
  Explanation: Lower numbers have higher priority; rule 200 matches first and stops processing before allow rule 300. Reference IDs: nsg.
- **b — Allow the connection because 300 has higher priority.**
  Explanation: Higher numeric values have lower priority; the matching deny rule at 200 is processed first. Reference IDs: nsg.
- **c — Combine the matching rules into an allow result.**
  Explanation: Processing stops at the first match rather than combining contradictory matching rules. Reference IDs: nsg.

Overall explanation: Lower numbers have higher priority; rule 200 matches first and stops processing before allow rule 300.

Source `nsg`: [Network security groups](https://learn.microsoft.com/en-us/azure/virtual-network/network-security-groups-overview)
Section: Security rules. Retrieved: 2026-10-08T00:48:17.887Z. Document updated: 2025-07-15T00:00:00Z.
Evidence: Retrieved Microsoft Learn section: Security rules. Claim evidence: Lower numbers have higher priority; rule 200 matches first and stops processing before allow rule 300. Higher numeric values have lower priority; the matching deny rule at 200 is processed first. Processing stops at the first match rather than combining contradictory matching rules.

Review decision: pending. Suggested review note: confirm all assumptions and explain any requested correction.

## az104-monitoring-01 — monitoring

Revision: 1; objective: `monitor`; status: draft; reviewer: none.

An operations team needs an alert to notify staff by email and invoke an automated workflow when its condition is met.

Which alert component groups those notification and action choices?

Correct option IDs: **a**

- **a — Action group**
  Explanation: Action groups trigger notifications or automated workflows; the documented examples include email and Logic Apps. Reference IDs: alerts.
- **b — User response**
  Explanation: User response records New, Acknowledged or Closed; it does not group notification and automation choices. Reference IDs: alerts.
- **c — Alert condition state**
  Explanation: Fired and Resolved describe the system-set condition state rather than the notification or automation configuration. Reference IDs: alerts.

Overall explanation: Action groups trigger notifications or automated workflows; the documented examples include email and Logic Apps.

Source `alerts`: [Overview of Azure Monitor alerts](https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-overview)
Section: Overview of Azure Monitor alerts. Retrieved: 2026-10-08T00:48:18.904Z. Document updated: 2026-07-08T00:00:00Z.
Evidence: Retrieved Microsoft Learn section: Overview of Azure Monitor alerts. Claim evidence: Action groups trigger notifications or automated workflows; the documented examples include email and Logic Apps. User response records New, Acknowledged or Closed; it does not group notification and automation choices. Fired and Resolved describe the system-set condition state rather than the notification or automation configuration.

Review decision: pending. Suggested review note: confirm all assumptions and explain any requested correction.
