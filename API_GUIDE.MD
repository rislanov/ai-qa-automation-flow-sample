# TestOps-Style API Guide

This guide shows the API shape used by the sample repository to export Smoke test cases from a TestOps-style TMS. All endpoints are placeholders. Replace them with your own TMS URL and keep credentials outside the repository.

## Sample Endpoint Contract

| Field | Sample Value |
|---|---|
| TMS endpoint | `https://testops.example.test` |
| Project ID | `100` |
| Suite tag | `Smoke` |
| Readiness tag | `automation:ai-ready` |
| User API key env | `TESTOPS_USER_API_KEY` |

## Local Environment

Set values outside the repository:

```bash
export TESTOPS_ENDPOINT="https://testops.example.test"
export TESTOPS_USER_API_KEY="<user-api-key>"
```

For examples below:

```bash
export ENDPOINT="${TESTOPS_ENDPOINT}"
export USER_TOKEN="${TESTOPS_USER_API_KEY}"
```

## Authenticate

Exchange a user API key for a short-lived bearer token if your TMS requires it:

```bash
JWT_TOKEN=$(curl -sS -X POST "${ENDPOINT}/api/uaa/oauth/token" \
  --form "grant_type=apitoken" \
  --form "scope=openid" \
  --form "token=${USER_TOKEN}" \
  | jq -r '.access_token')
```

Do not write `JWT_TOKEN` to any repository file.

## Verify Access

```bash
curl -sS "${ENDPOINT}/api/account/me" \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

Expected result: the token owner is returned and has access to the target project.

## Discover Metadata

Useful generic endpoints:

| Purpose | Request |
|---|---|
| List projects | `GET /api/project` |
| List tags | `GET /api/tag` |
| Validate case query | `GET /api/testcase/query/validate` |
| Search test cases | `GET /api/testcase/__search` |
| Get one test case | `GET /api/testcase/{id}` |
| Get normalized steps | `GET /api/testcase/{id}/step` |

Example project query:

```bash
curl -sS -G "${ENDPOINT}/api/project" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  --data-urlencode page=0 \
  --data-urlencode size=100
```

## Validate Case Query

```bash
curl -sS -G "${ENDPOINT}/api/testcase/query/validate" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  --data-urlencode projectId=100 \
  --data-urlencode 'rql=tag in ["Smoke"] and tag in ["automation:ai-ready"]'
```

## Export Smoke Cases

Search a project page by query:

```bash
curl -sS -G "${ENDPOINT}/api/testcase/__search" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  --data-urlencode projectId=100 \
  --data-urlencode 'rql=tag in ["Smoke"] and tag in ["automation:ai-ready"]' \
  --data-urlencode deleted=false \
  --data-urlencode page=0 \
  --data-urlencode size=500 \
  --data-urlencode sort=id,ASC
```

Fetch normalized steps:

```bash
curl -sS "${ENDPOINT}/api/testcase/0001/step" \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

## Map API Data To Markdown

The sync process writes normalized files under:

```text
cases/<suite>/<area>/TC-<id>.MD
```

For the sample checkout case:

```text
cases/smoke/checkout/TC-0001.MD
```

The Markdown file should include:

- frontmatter with IDs, tags, URLs, and `source_updated_at_utc`;
- Purpose;
- Environment;
- Test Data;
- Constraints;
- Cleanup;
- Steps;
- Expected Results;
- Evidence;
- Automation Notes.

## Troubleshooting

| Symptom | Likely Cause | Action |
|---|---|---|
| `401 Unauthorized` | Missing, expired, or invalid token | Refresh the bearer token from the API key. |
| `403 Forbidden` | Token owner lacks project access | Check project permissions in TMS. |
| `400` on query endpoints | Invalid query syntax | Validate the same query before export. |
| Missing steps | Case has no normalized scenario | Return the case to QA for review. |

## Safety Checklist

- Keep API keys and JWTs out of repository files.
- Store temporary raw API responses under `/private/tmp` or another ignored location.
- Commit only normalized Markdown cases, tests, support code, and docs.
- Use placeholder URLs in sample files.
