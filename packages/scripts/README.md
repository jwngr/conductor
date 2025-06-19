# Conductor Scripts

This package contains utility scripts for the Conductor project, including a development data bootstrap script.

## Development Data Bootstrap

The bootstrap script creates realistic test data for local development, including:

- User feed subscriptions (RSS, YouTube, Interval)
- Feed items with sample content
- Account experiments
- Sample HTML content and AI-generated summaries

### Prerequisites

1. **Firebase Emulators**: Make sure Firebase emulators are running locally

### Usage

From the project root, run:

```bash
# Navigate to scripts package
cd packages/scripts

# Run the bootstrap script with just an email
yarn bootstrap <email>
```

Or from the project root:

```bash
yarn workspace @conductor/scripts bootstrap <email>
```

### Arguments

- `email` - Email address for the test account (Firebase UID is generated automatically)

### Example

```bash
yarn bootstrap test@example.com
```

### What Gets Created

The bootstrap script creates:

1. **Account**: A new account with a generated Firebase UID and your specified email
2. **User Feed Subscriptions**:
   - TechCrunch RSS feed
   - CNN RSS feed
   - BBC News RSS feed
   - MrBeast YouTube channel
   - 5-minute interval feed
3. **Feed Items**:
   - 3 sample RSS articles with realistic content
   - 1 interval feed item
4. **Experiments**: Default experiment state for the account

### Sample Content

The script includes sample HTML content and AI-generated markdown summaries in `src/resources/sampleContent/` to demonstrate the content structure.

### Troubleshooting

- **Firebase Connection**: Ensure Firebase emulators are running and accessible
- **Arguments**: Verify the email argument is provided
- **Permissions**: Ensure your Firebase project allows the operations

### Customization

You can modify the sample data by editing:

- `src/lib/bootstrap/userFeedSubscriptions.ts` - Change RSS feeds, YouTube channels, etc.
- `src/lib/bootstrap/feedItems.ts` - Modify sample articles and content
- `src/resources/sampleContent/` - Update HTML content and summaries

### Reset Data

To start fresh, you can:

1. Clear your Firebase emulator data
2. Run the bootstrap script again with a new email
3. Or manually delete specific collections in the Firebase emulator UI
