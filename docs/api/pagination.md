# Pagination and filters

The current API does not expose pagination, cursors, search filters, or sort arguments. `equipment`, `exercises`, `users`, and `sessions` return complete lists. Equipment and exercises are ordered by scope and name; sessions are ordered by most recent use. No ordering guarantee is documented for `users`.

Flutter clients should avoid assuming that list size is bounded. Before any list becomes large, introduce an additive connection or page input/output contract, preserve existing operations during migration, and document stable sort semantics.
