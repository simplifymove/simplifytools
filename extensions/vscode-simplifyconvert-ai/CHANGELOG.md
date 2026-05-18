# Changelog

All notable changes to SimplifyConvert AI Code Assistant will be documented in this file.

## [0.0.1] - 2024-01-15

### Added
- Initial MVP release
- Sidebar chat panel with real-time messaging
- Explain Code command
- Fix Code command
- Optimize Code command
- Generate Comments command
- Debug Error command
- API key management (set/clear)
- Secure API key storage using VS Code SecretStorage
- Machine ID generation and persistence
- Right-click context menu integration
- Settings for API base URL and model label
- Comprehensive error handling with friendly messages
- Privacy/security features (.env file blocking)
- Credit usage tracking and display
- Support for all major programming languages
- Configuration in VS Code settings

### Features
- Chat interface with message history
- Selection-based commands
- Terminal error debugging
- Credits remaining display
- Model name display
- Loading states and user feedback
- Markdown/code block rendering in chat
- Textarea with send (Ctrl+Enter) and clear buttons
- Large selection warning (>10K chars)
- Rate limit and error handling

### Security
- Secure SecretStorage for API keys
- No full project scanning
- .env file blocking
- Only sends explicitly selected code
- Local machine ID generation
- No telemetry

### Documentation
- README.md with features and setup
- LOCAL_TESTING.md for development
- Inline code comments
- TypeScript for type safety

## Future Plans

### v0.1.0
- [ ] Streaming responses
- [ ] Multi-language support improvements
- [ ] Custom prompt templates
- [ ] Chat history export

### v0.2.0
- [ ] Code refactoring suggestions
- [ ] Performance metrics
- [ ] Custom keybindings
- [ ] Theme customization

### Later
- Autocomplete (VS Code InlineCompletionItem)
- Full repository indexing
- Embeddings for semantic search
- Vision/image understanding
- Design tool integration (Figma)
- Autonomous agents (ReAct)

## Known Issues

- No streaming responses in MVP (foundation ready for future)
- Chat history persists only in current session
- No offline mode support
- Single account per VS Code installation

## Support

For issues, bug reports, or feature requests:
- GitHub Issues: [SimplifyConvert/issues](https://github.com/SimplifyConvert/issues)
- Email: support@simplifyconvert.com
