import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import { Close, CloudUpload, Person, PhotoCamera } from '@mui/icons-material';
import { MAX_FILE_SIZE, processImageFile } from '../utils/imageUtils';

export default function AvatarUploadModal({ open, onClose, title = 'Update Profile Photo', currentPhoto, onSave, onRemove }) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Reset dialog state each time it opens
  useEffect(() => {
    if (open) {
      setPreview(currentPhoto || null);
      setFileName('');
      setError('');
      setSaving(false);
    }
  }, [open, currentPhoto]);

  const handleBrowseClick = () => fileInputRef.current?.click();

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // allow re-selecting the same file
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setError('The selected image is larger than 5 MB. Please choose a smaller photo.');
      return;
    }

    setError('');
    try {
      const dataUrl = await processImageFile(file);
      setPreview(dataUrl);
      setFileName(file.name);
    } catch {
      setError('Could not read that file as an image. Please choose a PNG, JPG, GIF or WEBP photo from your device.');
    }
  };

  const handleSave = async () => {
    if (!preview) {
      setError('Please choose a profile photo from your device first.');
      return;
    }
    setSaving(true);
    setError('');
    const result = await onSave(preview);
    setSaving(false);
    if (result?.success) {
      onClose();
    } else {
      setError(result?.message || 'Failed to update your profile photo.');
    }
  };

  const handleRemove = async () => {
    setSaving(true);
    setError('');
    const result = await onRemove();
    setSaving(false);
    if (result?.success) {
      onClose();
    } else {
      setError(result?.message || 'Failed to remove your profile photo.');
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          {title}
        </Typography>
        <IconButton onClick={onClose} size="small" disabled={saving}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ textAlign: 'center', py: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2, textAlign: 'left' }}>{error}</Alert>}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleFileChange}
        />

        <Box onClick={handleBrowseClick} sx={{ cursor: 'pointer' }}>
          <Avatar
            className="preview-avatar"
            src={preview || undefined}
            sx={{
              width: 140,
              height: 140,
              mx: 'auto',
              mb: 2,
              color: '#fff',
              fontSize: 56,
              fontWeight: 800,
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              border: '4px solid #fff',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              transition: 'transform 0.2s ease',
              '&:hover': { transform: 'scale(1.03)' },
            }}
          >
            <Person sx={{ fontSize: 64 }} />
          </Avatar>
        </Box>

        <Typography variant="body1" sx={{ fontWeight: 700 }}>
          {preview ? 'Looks good!' : 'Choose a photo from your device'}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          {fileName ? fileName : 'Click the photo or the button below to browse your device'}
        </Typography>

        <Button
          variant="contained"
          startIcon={<CloudUpload />}
          onClick={handleBrowseClick}
          disabled={saving}
          sx={{ mt: 2.5, borderRadius: 3 }}
        >
          Choose from Device
        </Button>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
        <Box>
          {currentPhoto && onRemove && (
            <Button onClick={handleRemove} color="inherit" disabled={saving}>
              Remove
            </Button>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={onClose} color="inherit" disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            className="btn-glow"
            disabled={saving || !preview}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <PhotoCamera />}
          >
            {saving ? 'Saving...' : 'Save Photo'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}