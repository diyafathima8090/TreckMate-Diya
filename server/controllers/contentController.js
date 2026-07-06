import Banner from '../models/Banner.js';


export const getBanners = async (req, res, next) => {
  try {
    let banners = await Banner.find({});
    
    
    if (banners.length === 0) {
      const initialBanners = [
        { title: "Summer Peaks Sale", imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b", link: "/trips?sale=summer", isActive: true },
        { title: "Explore Glacier Frontiers", imageUrl: "https://images.unsplash.com/photo-1517022812141-23620dba5c23", link: "/category/glacier", isActive: true }
      ];
      await Banner.insertMany(initialBanners);
      banners = await Banner.find({});
    }

    res.status(200).json({
      success: true,
      data: banners
    });
  } catch (error) {
    next(error);
  }
};


export const toggleBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    banner.isActive = !banner.isActive;
    await banner.save();

    
    const banners = await Banner.find({});
    res.status(200).json({ success: true, data: banners });
  } catch (error) {
    next(error);
  }
};

export const createBanner = async (req, res, next) => {
  const { title, imageUrl, link } = req.body;
  try {
    if (!title || !imageUrl || !link) {
      return res.status(400).json({ success: false, message: 'Please provide title, imageUrl, and link' });
    }

    const banner = await Banner.create({
      title,
      imageUrl,
      link,
      isActive: true
    });

    res.status(201).json({
      success: true,
      data: banner
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    await banner.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Banner deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
