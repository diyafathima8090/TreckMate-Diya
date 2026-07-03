import { v2 as cloudinary } from 'cloudinary';

// 1. Configure Cloudinary inline
cloudinary.config({
  cloud_name: 'dko1pcdxz',
  api_key: '577892184391951',
  api_secret: 'GjmRJrWnmLJd2bWX5gkE0sg1m-0'
});

async function runOnboarding() {
  try {
    console.log("Uploading sample image...");
    
    // 2. Upload an image
    const uploadResult = await cloudinary.uploader.upload(
      'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
      { folder: 'onboarding_demo' }
    );
    
    console.log("\nUpload Successful!");
    console.log("Secure URL:", uploadResult.secure_url);
    console.log("Public ID:", uploadResult.public_id);
    
    // 3. Get image details (metadata is returned in the upload response)
    console.log("\nImage Details:");
    console.log("Width:", uploadResult.width);
    console.log("Height:", uploadResult.height);
    console.log("Format:", uploadResult.format);
    console.log("File size (bytes):", uploadResult.bytes);
    
    // 4. Transform the image
    // f_auto: Automatically formats the image to the most efficient format for the requesting browser (e.g., WebP/AVIF).
    // q_auto: Automatically optimizes the image quality to balance file size and visual fidelity.
    const transformedUrl = cloudinary.url(uploadResult.public_id, {
      fetch_format: 'auto',
      quality: 'auto'
    });
    
    console.log("\nDone! Click the link below to see the optimized version of the image.");
    console.log("Check the size and the format in your browser's network tab:");
    console.log(transformedUrl);

  } catch (error) {
    console.error("Error during execution:", error);
  }
}

runOnboarding();
