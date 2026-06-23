# Exercises domain

Authenticated users can read system catalog exercises and their own exercises through `exercises` and `exerciseById`. `createExercise` creates a private `USER` record and accepts up to 100 unique accessible equipment IDs. `updateExercise` is limited to the caller's private exercises.

On update, providing `equipmentIds` replaces all existing associations. Use an empty list to remove every association; omit the field to retain the existing list. Names must be non-blank and at most 255 characters. System exercises are read-only.
