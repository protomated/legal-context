# Text Extraction Test Files

This directory is used for storing sample files to test the text extraction functionality in LegalContext.

## Adding Test Files

To test the text extraction functionality, you need to add sample PDF and DOCX files to this directory:

1. Place sample files in this directory:
   - `sample.pdf`: A sample PDF document
   - `sample.docx`: A sample DOCX document

2. Make sure the files are named exactly as specified above, or update the file paths in `src/tests/testTextExtraction.ts` to match your file names.

## Running the Test

Once you've added the test files, you can run the text extraction test using:

```bash
bun run test:extraction
```

This will:
1. Load each test file
2. Extract text using office-text-extractor
3. Display statistics and a preview of the extracted text

## Expected Output

The test will output:
- File information (name, size, type)
- Extraction time
- Number of characters extracted
- A preview of the extracted text

## Troubleshooting

If you encounter any issues:

1. Make sure the test files exist in this directory
2. Check that the file paths in `src/tests/testTextExtraction.ts` match your file names
3. Verify that the files are valid PDF and DOCX documents
4. Check the console output for any error messages

## Security Note

The test files you add to this directory should not contain sensitive information, as they may be committed to the repository.
