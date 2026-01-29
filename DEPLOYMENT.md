
# ARBITRA Deployment & Android Packing

## 1. Web Hosting (InfinityFree)
* Upload all files to the `htdocs` folder.
* Ensure `.htaccess` is present.
* Open your site in Chrome on Android, tap the three dots (⋮), and select **"Install App"**. 
* The `manifest.json` will make it look and act like a real Android app.

## 2. Converting to a Native Android App (.APK)
If you want a real `.apk` file that you can share or put on the Play Store:

1. **Install Capacitor CLI**: 
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   ```
2. **Initialize Android Project**:
   ```bash
   npx cap add android
   ```
3. **Copy Web Files**:
   Ensure your website files are in the `htdocs` folder, then run:
   ```bash
   npx cap copy
   ```
4. **Build in Android Studio**:
   ```bash
   npx cap open android
   ```
   - This will open **Android Studio**.
   - Click **Build** -> **Build Bundle(s) / APK(s)** -> **Build APK**.
   - Your Android app is now packed!

## 3. Java Integration
The code in `android/MainActivity.java` acts as the bridge. It creates a "WebView" (a mini browser) inside a Java container that runs the React code. This allows the app to:
* Access the device's storage.
* Stay active in the background for scanning.
* Run at full native speed.

## 4. Database Persistence
In the Android app, the "Database" (LocalStorage) is saved in the app's private data folder. This means even if the user clears their Chrome cache, the Android App's data remains safe.
