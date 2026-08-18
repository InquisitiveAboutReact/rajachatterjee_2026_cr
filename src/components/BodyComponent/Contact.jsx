import React from 'react';
import { Box, Typography, IconButton, Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import LinkedInIcon from '@material-ui/icons/LinkedIn';
import GitHubIcon from '@material-ui/icons/GitHub';

const useStyles = makeStyles((theme) => ({
  contact: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(2),
  },
  contactDesc: {
    marginBottom: theme.spacing(1),
    textAlign: 'center',
  },
  icons: {
    display: 'flex',
    gap: theme.spacing(2),
  },
}));

function Contact() {
  const classes = useStyles();
  const openLink = (url) => () => window.open(url, '_blank', 'noopener,noreferrer');

  return (
    <Box id="Contact" className={classes.contact}>
      <Typography variant="h6" component="p" className={classes.contactDesc}>
        Please contact me through LinkedIn or GitHub by clicking the icons below.
      </Typography>
      <Box className={classes.icons}>
        <Tooltip title="LinkedIn">
          <IconButton onClick={openLink('https://www.linkedin.com/in/rajachatterjee84/')}> 
            <LinkedInIcon fontSize="large" />
          </IconButton>
        </Tooltip>
        <Tooltip title="GitHub">
          <IconButton onClick={openLink('https://github.com/InquisitiveAboutReact')}> 
            <GitHubIcon fontSize="large" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

export default Contact;

import React from 'react';
import { useStyles } from './BodyStyle';
import LinkedInIcon from '@material-ui/icons/LinkedIn';
import GitHubIcon from '@material-ui/icons/GitHub';

function Contact() {
    const classes = useStyles();
    return (
        <Box id="Contact" className={classes.contact}>
         <Typography variant="h6" component="p" className={classes.contactdesc}>
             Please Contact Me through Linkedin or Github by clicking below link/s
         </Typography>
         <br />
         <LinkedInIcon onClick={()=>{window.open("https://www.linkedin.com/in/rajachatterjee84/")}} onmouseover="" style={{cursor: "pointer", paddingRight:'10px'}}/> 
         <GitHubIcon onClick={()=>{window.open("https://github.com/InquisitiveAboutReact")}} onmouseover="" style={{cursor: "pointer"}}/>


        </Box>
    )
}

export default Contact
