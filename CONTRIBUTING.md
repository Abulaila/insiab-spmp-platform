# 🤝 Contributing to Insiab SPM/PPM Platform

Thank you for your interest in contributing to the Insiab SPM/PPM Platform! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [Getting Started](#-getting-started)
- [Development Workflow](#-development-workflow)
- [Coding Standards](#-coding-standards)
- [Commit Guidelines](#-commit-guidelines)
- [Pull Request Process](#-pull-request-process)
- [Issue Guidelines](#-issue-guidelines)
- [Security](#-security)

## 🌟 Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

### Our Standards

- **Be respectful** and inclusive in all interactions
- **Be constructive** in feedback and discussions
- **Be collaborative** and help others learn and grow
- **Be professional** in all communications

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18 or higher
- **npm** or **yarn**
- **Git**
- **PostgreSQL** (for production setup)

### Local Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/yourusername/insiab-spmp-platform.git
   cd insiab-spmp-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Initialize the database**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Run health check**
   ```bash
   npm run health-check
   ```

## 🔄 Development Workflow

### Branch Strategy

We use **GitFlow** for branch management:

- **`main`**: Production-ready code
- **`develop`**: Integration branch for features
- **`feature/feature-name`**: New features
- **`hotfix/issue-description`**: Critical bug fixes
- **`release/version-number`**: Release preparation

### Creating a Feature Branch

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

### Development Process

1. **Create a feature branch** from `develop`
2. **Make your changes** following coding standards
3. **Write tests** for new functionality
4. **Run quality checks** locally
5. **Commit your changes** with proper messages
6. **Push to your fork** and create a pull request

### Quality Checks

Before committing, run these checks:

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Health check
npm run health-check

# Build test
npm run build
```

## 💻 Coding Standards

### TypeScript Guidelines

- **Strict mode**: Always use TypeScript in strict mode
- **Types**: Prefer explicit types over `any`
- **Interfaces**: Use interfaces for object shapes
- **Enums**: Use enums for constants with semantic meaning
- **Naming**: Use descriptive, camelCase variable names

```typescript
// ✅ Good
interface ProjectWithDetails {
  id: string;
  name: string;
  status: ProjectStatus;
  teamMembers: TeamMember[];
}

// ❌ Bad
interface Project {
  id: any;
  data: any;
}
```

### React Component Guidelines

- **Functional Components**: Use functional components with hooks
- **Props Interface**: Define props interface for each component
- **Default Props**: Use default parameters instead of defaultProps
- **Hooks**: Follow React hooks rules and conventions

```typescript
// ✅ Good
interface ProjectCardProps {
  project: ProjectWithDetails;
  onEdit?: (project: ProjectWithDetails) => void;
  className?: string;
}

export function ProjectCard({ 
  project, 
  onEdit, 
  className = "" 
}: ProjectCardProps) {
  // Component implementation
}
```

### CSS and Styling

- **Tailwind CSS**: Use Tailwind utility classes
- **Custom CSS**: Minimize custom CSS, prefer Tailwind
- **Responsive**: Always consider mobile-first design
- **Dark Mode**: Ensure components work in both themes

### Database and API

- **Prisma**: Use Prisma for all database operations
- **API Routes**: Follow RESTful conventions
- **Error Handling**: Implement proper error responses
- **Validation**: Validate all inputs on both client and server

## 📝 Commit Guidelines

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Commit Types

- **feat**: New features
- **fix**: Bug fixes
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **build**: Build system changes
- **ci**: CI/CD changes
- **chore**: Maintenance tasks

### Examples

```bash
# New feature
git commit -m "feat(kanban): add drag and drop for cards"

# Bug fix
git commit -m "fix(api): handle null values in project creation"

# Documentation
git commit -m "docs: update installation instructions"

# Breaking change
git commit -m "feat(auth)!: implement new authentication system

BREAKING CHANGE: The authentication API has been completely redesigned."
```

## 🔀 Pull Request Process

### Before Creating a PR

1. **Sync with latest changes**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout your-feature-branch
   git rebase develop
   ```

2. **Run all quality checks**
   ```bash
   npm run lint
   npm run type-check
   npm run health-check
   npm run build
   ```

3. **Update documentation** if needed

### PR Template

When creating a pull request, include:

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] I have tested these changes locally
- [ ] I have added tests for new functionality
- [ ] All existing tests pass

## Screenshots
If applicable, add screenshots

## Checklist
- [ ] My code follows the project's coding standards
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
```

### Review Process

1. **Automated checks** must pass
2. **Code review** by at least one maintainer
3. **No merge conflicts** with target branch
4. **Documentation** updated if needed
5. **Tests** passing and coverage maintained

## 🐛 Issue Guidelines

### Before Creating an Issue

1. **Search existing issues** to avoid duplicates
2. **Check the roadmap** to see if it's already planned
3. **Use the latest version** to verify the issue exists

### Issue Types

- **🐛 Bug Report**: Something isn't working
- **✨ Feature Request**: New functionality
- **📚 Documentation**: Improvements to docs
- **🔧 Maintenance**: Technical debt or improvements

### Writing Good Issues

- **Clear title**: Summarize the issue in one line
- **Detailed description**: Provide context and details
- **Steps to reproduce**: For bugs, include reproduction steps
- **Expected behavior**: What should happen
- **Environment**: Browser, OS, version info
- **Screenshots**: Visual aids when helpful

## 🔒 Security

- **Never commit secrets** or credentials
- **Report security issues** privately via security@insiab.com
- **Follow security best practices** in all code
- **Keep dependencies updated** and secure

## 📊 Performance Guidelines

- **Optimize components** for re-rendering
- **Use proper keys** in lists
- **Implement lazy loading** for large datasets
- **Monitor bundle size** and loading performance
- **Use proper database indexing** and queries

## 🧪 Testing Guidelines

### Testing Strategy

- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user workflows
- **Performance Tests**: Monitor application performance

### Writing Tests

```typescript
// Component test example
describe('ProjectCard', () => {
  it('should render project information correctly', () => {
    const mockProject = {
      id: '1',
      name: 'Test Project',
      status: ProjectStatus.ACTIVE
    };

    render(<ProjectCard project={mockProject} />);
    
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });
});
```

## 📚 Documentation

### Code Documentation

- **JSDoc comments** for complex functions
- **README updates** for new features
- **API documentation** for new endpoints
- **Component props** documentation

### Commit Documentation

Every significant change should include:
- **What** changed
- **Why** it was changed
- **How** to use new features
- **Migration notes** for breaking changes

## 🏷️ Labels and Project Management

### Issue Labels

- **Priority**: `priority:high`, `priority:medium`, `priority:low`
- **Type**: `bug`, `enhancement`, `documentation`
- **Status**: `needs-investigation`, `in-progress`, `ready-for-review`
- **Area**: `frontend`, `backend`, `database`, `ci/cd`

### Project Boards

We use GitHub Projects to track:
- **Backlog**: Planned features and fixes
- **In Progress**: Currently being worked on
- **Review**: Awaiting code review
- **Done**: Completed and merged

## 💬 Getting Help

- **GitHub Discussions**: For questions and community discussion
- **GitHub Issues**: For bug reports and feature requests
- **Discord/Slack**: For real-time chat (coming soon)
- **Email**: support@insiab.com for general inquiries

## 🎉 Recognition

We appreciate all contributors! Contributors will be:
- **Listed in CONTRIBUTORS.md**
- **Mentioned in release notes** for significant contributions
- **Eligible for contributor perks** (coming soon)

---

Thank you for contributing to the Insiab SPM/PPM Platform! Together, we're building the future of project management. 🚀

*Last Updated: July 2025*