# Equipment domain

Authenticated users can read system catalog equipment and their own equipment through `equipment` and `equipmentById`. `createEquipment` always creates a private `USER` record. `updateEquipment` accepts only private equipment owned by the caller; it cannot alter catalog (`SYSTEM`) equipment.

Names must be non-blank and at most 255 characters. Descriptions are optional; on update, `null` clears a description. Equipment can be associated with exercises only when it is accessible to that exercise owner.
