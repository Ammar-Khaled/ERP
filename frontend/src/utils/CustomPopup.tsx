import { Modal, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export const CustomPopup = ({ isOpen, handleClose, content }: { isOpen: boolean; handleClose: () => void; content: React.ReactNode }) => {
  return (
    <Modal open={isOpen} onClose={handleClose} aria-labelledby="popup-title" aria-describedby="popup-description">
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2
        }}
      >
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            color: 'grey.600'
          }}
        >
          <CloseIcon />
        </IconButton>

        <Box id="popup-description">{content}</Box>
      </Box>
    </Modal>
  );
};

// For Example
// const PopupExample = () => {
//   const [isOpen, setIsOpen] = useState(false);

//   const handleOpen = () => setIsOpen(true);
//   const handleClose = () => setIsOpen(false);

//   return (
//     <div>
//       <Button variant="contained" color="primary" onClick={handleOpen}>
//         Open Popup
//       </Button>

//       <CustomPopup
//         isOpen={isOpen}
//         handleClose={handleClose}
//         content={<Typography>This is dynamic content! You can replace it with any React element or content.</Typography>}
//       />
//     </div>
//   );
// };
