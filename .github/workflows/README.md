# GitHub Actions Workflows

## Claude PR Review

The Claude PR Review workflow allows you to get AI-powered code reviews on pull requests by commenting `@claude review`.

### Setup

1. **Add Anthropic API Key**: 
   - Go to Repository Settings → Secrets and variables → Actions
   - Add a new repository secret named `ANTHROPIC_API_KEY`
   - Set the value to your Anthropic API key

### Usage

On any pull request, comment:
```
@claude review
```

Claude will analyze:
- Code quality and best practices
- Potential bugs or issues
- Performance considerations
- Security concerns
- Consistency with existing codebase
- Test coverage

The review will be posted as a comment on the PR.

## Update Changelog

Automatically updates the changelog when commits are pushed to main.

## Deploy (Currently Disabled)

The deploy.yml workflow is currently disabled but can be re-enabled for automatic deployment.