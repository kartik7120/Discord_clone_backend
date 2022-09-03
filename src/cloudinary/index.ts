import cloudinary from "cloudinary"
import dotenv from "dotenv"
dotenv.config()
cloudinary.v2.config({
    api_key: process.env.CLOUDINARY_API_KEY,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
})
export default cloudinary;