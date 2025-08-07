# 🧪 Version Management System Testing Guide

## Overview
This guide will help you test the comprehensive version management system that has been implemented for the PENTA UNTITLED PROJECT RP EMS content management platform.

## ✅ Pre-Testing Checklist

1. **Development Server Running**: Ensure `npm run dev` is running
2. **Database Connection**: Verify Appwrite connection is working
3. **User Authentication**: Make sure you can log in as an editor, admin, or super admin
4. **Content Permissions**: Ensure your user has content creation/editing permissions

## 🎯 Test Scenarios

### 1. **Content Creation with Initial Version**

**Steps:**
1. Navigate to `/dashboard/content/new`
2. Fill out the content form:
   - Title: "Test Version Management"
   - Slug: "test-version-management"
   - Content: "This is the initial version of our test content."
   - Type: "SOP"
   - Status: "Draft"
3. Click "Save Content"

**Expected Result:**
- Content is created successfully
- Initial version (v1) is automatically created
- Redirected to content management page

### 2. **Editing Content and Creating New Versions**

**Steps:**
1. Go to `/dashboard/content` and find your test content
2. Click "Edit" on the test content
3. In the edit form:
   - Update title to "Test Version Management - Updated"
   - Add to content: "\n\nThis is version 2 with additional information."
   - Add changes summary: "Added more details and updated title"
4. Click "Update Content"

**Expected Result:**
- Content is updated successfully
- New version (v2) is created
- Changes summary is recorded
- Author attribution is correct

### 3. **Viewing Version History**

**Steps:**
1. Edit the same content again
2. Click on the "History" tab
3. Examine the version history display

**Expected Result:**
- See both versions (v1 and v2) listed
- Current version is highlighted
- Author information is displayed
- Timestamps are accurate
- Changes summary is shown for v2
- Version statistics are displayed correctly

### 4. **Comparing Versions**

**Steps:**
1. In the version history, click the compare button between v1 and v2
2. Examine the comparison dialog

**Expected Result:**
- Side-by-side comparison opens
- Changes are highlighted with colors
- Field-by-field breakdown shows differences
- Author context is displayed for both versions

### 5. **Restoring Previous Version**

**Steps:**
1. Create a third version by editing content again:
   - Change title to "Test Version Management - Final"
   - Add content: "\n\nThis is version 3 - the final version."
   - Changes summary: "Final updates"
2. Save the changes
3. Go to version history
4. Click restore on version 2
5. Confirm the restoration

**Expected Result:**
- New version (v4) is created with content from v2
- Content is restored successfully
- All version history is preserved
- New version has proper change summary indicating restoration

### 6. **Permission Testing**

**Steps:**
1. Test with different user roles (if available):
   - Viewer: Should not see version history
   - Editor: Should see version history for their department
   - Admin: Should see version history for their department
   - Super Admin: Should see all version history

**Expected Result:**
- Permissions are enforced correctly
- Unauthorized users get proper error messages

## 🔍 What to Look For

### ✅ **Success Indicators:**
- [ ] Content creation works without errors
- [ ] Versions are created automatically on updates
- [ ] Version history displays correctly
- [ ] Version comparison shows accurate diffs
- [ ] Version restoration works properly
- [ ] Author attribution is correct
- [ ] Timestamps are accurate
- [ ] Change summaries are saved and displayed
- [ ] Current version is properly marked
- [ ] Statistics are calculated correctly

### ❌ **Potential Issues:**
- 500 errors during content creation/update
- Version history not loading
- Comparison tool not working
- Restoration failing
- Missing author information
- Incorrect version numbers
- Permission errors

## 🐛 Troubleshooting

### **Content Creation Fails (500 Error)**
- Check browser console for detailed error
- Verify user authentication
- Ensure all required fields are filled
- Check Appwrite database connection

### **Version History Not Loading**
- Check API endpoints are accessible
- Verify user has proper permissions
- Check browser network tab for failed requests

### **Comparison Tool Issues**
- Ensure both versions exist
- Check if version data is properly formatted
- Verify API response structure

### **Restoration Problems**
- Confirm user has edit permissions
- Check if target version exists
- Verify restoration API is working

## 📊 Performance Checks

1. **Page Load Times**: Version history should load quickly
2. **Database Queries**: Check for efficient queries (no N+1 problems)
3. **Memory Usage**: Large content shouldn't cause memory issues
4. **Network Requests**: Minimize unnecessary API calls

## 🎉 Success Criteria

The version management system is working correctly if:

1. **All test scenarios pass** without errors
2. **Version history is accurate** and complete
3. **Comparisons show proper diffs** between versions
4. **Restoration creates new versions** (doesn't overwrite)
5. **Permissions are enforced** correctly
6. **Performance is acceptable** for typical usage
7. **UI is responsive** and user-friendly

## 📝 Test Results Template

```
Date: [DATE]
Tester: [YOUR NAME]
Browser: [BROWSER/VERSION]

Test Results:
□ Content Creation: PASS/FAIL
□ Version Creation: PASS/FAIL  
□ Version History: PASS/FAIL
□ Version Comparison: PASS/FAIL
□ Version Restoration: PASS/FAIL
□ Permissions: PASS/FAIL

Notes:
[Any issues or observations]

Overall Status: PASS/FAIL
```

---

**Happy Testing! 🚀**

The version management system is designed to be robust and user-friendly. If you encounter any issues during testing, please document them with as much detail as possible including browser console logs and network request details. 