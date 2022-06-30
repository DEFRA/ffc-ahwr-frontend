# 2. Do not expire magic-links on use

Date: 2022-06-30

## Status

Accepted

## Context

Email clients and other tools can scan links before they are visited, in an
attempt to keep the user safe from visiting malicious sites. This doesn't work
very well when the link is a one time use, as the magic-link implementation
within this application is.

## Decision

Magic-links should not be expired on use, rather they should expire on the
timeout.

## Consequences

All links will be valid for the full period of the timeout rather than until
they are used. All links associated to the email were also being expired
(removed from cache) when one was used, this will also no longer happen. This
results in all magic-links only expiring when their period of validity ends.

The magic-link login method will be replaced with a dedicated identity solution
in time and remove this issue entirely.
