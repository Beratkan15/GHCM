#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const boxen = require('boxen');
const gradient = require('gradient-string');
const figlet = require('figlet');
const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Language configurations
const languages = {
  en: {
    welcome: 'Welcome to GHCM - GitHub Clone Manager',
    cloning: 'Cloning repository...',
    success: 'Repository cloned successfully!',
    error: 'Failed to clone repository',
    invalidRepo: 'Invalid repository format. Use: username/repository',
    alreadyExists: 'Directory already exists',
    location: 'Location',
    usage: 'Usage: ghcm <username/repository> [options]',
    examples: 'Examples',
    langChanged: 'Language changed to English',
    help: {
      description: 'GitHub Clone Manager - A beautiful CLI tool for cloning GitHub repositories',
      repo: 'Repository in format username/repository',
      lang: 'Set language (en/tr)',
      dir: 'Custom directory name for cloning'
    }
  },
  tr: {
    welcome: 'GHCM\'ye Hoş Geldiniz - GitHub Clone Manager',
    cloning: 'Depo klonlanıyor...',
    success: 'Depo başarıyla klonlandı!',
    error: 'Depo klonlanamadı',
    invalidRepo: 'Geçersiz depo formatı. Kullanım: kullanıcıadı/depo',
    alreadyExists: 'Dizin zaten mevcut',
    location: 'Konum',
    usage: 'Kullanım: ghcm <kullanıcıadı/depo> [seçenekler]',
    examples: 'Örnekler',
    langChanged: 'Dil Türkçe olarak değiştirildi',
    help: {
      description: 'GitHub Clone Manager - GitHub depolarını klonlamak için güzel bir CLI aracı',
      repo: 'kullanıcıadı/depo formatında depo',
      lang: 'Dil ayarla (en/tr)',
      dir: 'Klonlama için özel dizin adı'
    }
  }
};

// Get user's language preference
function getLanguage() {
  const configPath = path.join(os.homedir(), '.ghcm-config.json');
  try {
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return config.language || 'en';
    }
  } catch (error) {
    // Ignore errors, use default
  }
  return 'en';
}

// Save user's language preference
function saveLanguage(lang) {
  const configPath = path.join(os.homedir(), '.ghcm-config.json');
  try {
    const config = { language: lang };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Could not save language preference:', error.message);
  }
}

// Display welcome banner
function showBanner() {
  const ghBanner = figlet.textSync('GH', {
    font: 'ANSI Shadow',
    horizontalLayout: 'default',
    verticalLayout: 'default'
  });
  
  const cmBanner = figlet.textSync('CM', {
    font: 'ANSI Shadow',
    horizontalLayout: 'default',
    verticalLayout: 'default'
  });
  
  // Split banners into lines
  const ghLines = ghBanner.split('\n');
  const cmLines = cmBanner.split('\n');
  
  // Combine lines with colors
  const maxLines = Math.max(ghLines.length, cmLines.length);
  for (let i = 0; i < maxLines; i++) {
    const ghLine = ghLines[i] || '';
    const cmLine = cmLines[i] || '';
    console.log(chalk.blue(ghLine) + chalk.magenta(cmLine));
  }
}

// Format repository URL
function formatRepoUrl(repo) {
  if (repo.includes('github.com')) {
    return repo;
  }
  
  // Handle username/repository format
  if (repo.includes('/')) {
    return `https://github.com/${repo}.git`;
  }
  
  return null;
}

// Clone repository with beautiful UI
async function cloneRepository(repoInput, options = {}) {
  const currentLang = getLanguage();
  const t = languages[currentLang];
  
  const repoUrl = formatRepoUrl(repoInput);
  if (!repoUrl) {
    console.log(chalk.red(`❌ ${t.invalidRepo}`));
    return;
  }
  
  // Extract repository name
  const repoName = options.dir || repoInput.split('/').pop().replace('.git', '');
  const targetPath = path.join(process.cwd(), repoName);
  
  // Check if directory already exists
  if (fs.existsSync(targetPath)) {
    console.log(chalk.yellow(`⚠️  ${t.alreadyExists}: ${repoName}`));
    return;
  }
  
  // Show cloning progress
  const spinner = ora({
    text: chalk.cyan(t.cloning),
    spinner: 'dots12',
    color: 'cyan'
  }).start();
  
  try {
    const git = simpleGit();
    await git.clone(repoUrl, targetPath);
    
    spinner.succeed(chalk.green(` ${t.success}`));
    
    // Show success box
    const successBox = boxen(
      chalk.green(`🎉 ${t.success}\n\n`) +
      chalk.cyan(`📁 ${t.location}: `) + chalk.white(targetPath) + '\n' +
      chalk.gray(`🔗 ${repoUrl}`),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'green',
        backgroundColor: 'black'
      }
    );
    
    console.log(successBox);
    
  } catch (error) {
    spinner.fail(chalk.red(`❌ ${t.error}`));
    console.log(chalk.red(`Error: ${error.message}`));
  }
}

// Main CLI setup
const program = new Command();
const currentLang = getLanguage();
const t = languages[currentLang];

program
  .name('ghcm')
  .description(t.help.description)
  .version('1.0.0');

// Main clone command
program
  .argument('[repository]', t.help.repo)
  .option('-d, --dir <name>', t.help.dir)
  .option('-l, --lang <language>', t.help.lang)
  .action(async (repository, options) => {
    // Handle language change
    if (options.lang) {
      if (options.lang === 'en' || options.lang === 'tr') {
        saveLanguage(options.lang);
        const newT = languages[options.lang];
        console.log(chalk.green(`✅ ${newT.langChanged}`));
        return;
      } else {
        console.log(chalk.red('❌ Supported languages: en, tr'));
        return;
      }
    }
    
    // Show banner
    showBanner();
    
    if (!repository) {
      console.log(chalk.cyan(`\n${t.usage}\n`));
      console.log(chalk.yellow(`${t.examples}:`));
      console.log(chalk.white('  ghcm Beratkan15/GHCM'));
      console.log(chalk.white('  ghcm microsoft/vscode -d my-vscode'));
      console.log(chalk.white('  ghcm -l tr  # Change language to Turkish'));
      console.log(chalk.white('  ghcm -l en  # Change language to English\n'));
      return;
    }
    
    await cloneRepository(repository, options);
  });

// Parse command line arguments
program.parse();
