import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const animationsPath = path.join(__dirname, '../data/animationData.json');

const getAnimations = () => {
  try {
    const data = fs.readFileSync(animationsPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading animations:', err);
    return {};
  }
};

/**
 * @route POST /api/avatar-animation
 * @desc Get keyframe coordinate data for a given animation id
 */
router.post('/', (req, res) => {
  const { animation_id } = req.body;

  if (!animation_id) {
    return res.status(400).json({
      success: false,
      error: 'animation_id parameter is required'
    });
  }

  const animations = getAnimations();
  const animation = animations[animation_id];

  if (animation) {
    res.json({
      success: true,
      animation_id: animation_id,
      label: animation.label,
      duration: animation.duration,
      keyframes: animation.keyframes,
      fallback_steps: animation.fallback_steps
    });
  } else {
    res.status(404).json({
      success: false,
      error: `Animation with ID '${animation_id}' not found`
    });
  }
});

export default router;
