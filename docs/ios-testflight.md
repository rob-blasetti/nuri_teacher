# iOS TestFlight

This project uses Fastlane through Bundler.

## Setup

1. Copy `ios/fastlane/.env.beta.example` to `ios/fastlane/.env.beta` and fill in the values.
2. Make sure the App Store Connect API key file referenced by `ASC_KEY_FILE` exists on this Mac.
3. Make sure the app record exists in App Store Connect for `com.liquidspirit.nuriteacher`.
4. Make sure the `match` signing repo `git@github.com:rob-blasetti/signing-repo.git` is accessible from this Mac.

## Install

```sh
bundle install
```

## Upload a build

```sh
cd ios
bundle exec fastlane beta
```

The lane will:

1. Load secrets from `ios/fastlane/.env.beta`.
2. Fetch signing assets with `match`.
3. Update the iOS bundle identifier to `com.liquidspirit.nuriteacher`.
4. Increment the iOS build number in `ios/nuri_teacher.xcodeproj`.
5. Write environment values into `ios/Config.xcconfig`.
6. Build the `nuri_teacher` workspace with manual App Store signing.
7. Upload the archive to TestFlight using the App Store Connect API key.

## Important

The lane creates `ios/Config.xcconfig`, but the current Xcode project does not yet import that file anywhere. As of now, this means the file is generated during the lane, but those values are not automatically consumed by the app unless you wire `Config.xcconfig` into the Xcode build settings or app code.
