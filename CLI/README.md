# GHCM - GitHub Clone Manager

A beautiful CLI tool that simplifies GitHub repository cloning with style and elegance, inspired by tools like fastfetch. Available as both CLI and desktop application with MSI installer.

## Features

✨ **Beautiful Interface** - Elegant terminal UI with colors, gradients, and animations  
🚀 **Simple Usage** - Clone repos with just `ghcm username/repository`  
🌍 **Multi-language** - Support for English and Turkish  
📦 **Smart Cloning** - Automatic URL formatting and error handling  
🎨 **Progress Indicators** - Beautiful loading spinners and success messages  
⚙️ **Configurable** - Custom directory names and language preferences  

## Installation

### Option 1: MSI Installer (Recommended for Windows)
1. Download the latest MSI installer from [Releases](https://github.com/Beratkan15/GHCM/releases)
2. Run the installer and follow the setup wizard
3. Launch GHCM from desktop shortcut or Start Menu

### Option 2: NPM (CLI only)
```bash
npm install -g ghcm
```

## Usage

```bash
ghcm Beratkan15/GHCM
```

### Custom directory name
```bash
ghcm microsoft/vscode -d my-vscode-fork
```

### Language settings
```bash
# Change to Turkish
ghcm -l tr

# Change to English (default)
ghcm -l en
```

### Help
```bash
ghcm --help
```

## Examples

```bash
# Clone a repository
ghcm Beratkan15/GHCM

# Clone with custom directory name
ghcm facebook/react -d my-react

# Change language to Turkish
ghcm -l tr

# Show help and examples
ghcm
```

## Features in Detail

### Beautiful UI
- ASCII art banner with rainbow gradients
- Animated loading spinners
- Colored success/error messages
- Boxed output with borders
- Progress indicators

### Multi-language Support
- English (default)
- Turkish
- Language preference is saved automatically

### Smart Repository Handling
- Accepts `username/repository` format
- Automatically converts to full GitHub URLs
- Validates repository format
- Checks for existing directories

## Requirements

- Node.js >= 14.0.0
- Git installed on your system
- Internet connection for cloning repositories

## Dependencies

- `chalk` - Terminal colors
- `commander` - CLI framework
- `ora` - Loading spinners
- `boxen` - Terminal boxes
- `gradient-string` - Gradient text
- `figlet` - ASCII art text
- `simple-git` - Git operations
- `inquirer` - Interactive prompts

## License

MIT License - see LICENSE file for details

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Comparison

| Traditional Way | GHCM Way |
|----------------|---------|
| `git clone https://github.com/Beratkan15/GHCM.git` | `ghcm Beratkan15/GHCM` |
| Plain terminal output | Beautiful colored interface |
| No progress indication | Animated loading spinners |
| English only | Multi-language support |
| Manual URL formatting | Automatic URL handling |

---

Made with ❤️ for developers who love beautiful terminals
