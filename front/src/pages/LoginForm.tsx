import { useState, useId } from 'react';
import { TextField, Button } from '@mui/material';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InputAdornment from '@mui/material/InputAdornment';
import { useAuthContext } from '../context/AuthContext';
import { useNotificationContext } from '../context/NotificationContext';

// interface LoginFormProps {
//   login: (username: string, password: string) => Promise<void>;
// }

const LoginForm = () => {
  const { login } = useAuthContext();
  const { showNotification } = useNotificationContext();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const outlinedPasswordId = useId();

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleLogin = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event?.preventDefault();
    try {
      await login(username, password);
      setUsername('');
      setPassword('');
    } catch (error) {
      showNotification('Error logging in', 'error');
      console.log(error);
    }
  };

  const handlePWChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleUNChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
      }}
    >
      <h2>Login</h2>

      <Box
        component="form"
        onSubmit={handleLogin}
        sx={{ '& > :not(style)': { m: 1, width: '25ch' } }}
        noValidate
        autoComplete="off"
      >
        <div>
          <TextField
            id="outlined-required"
            label="Username"
            variant="outlined"
            placeholder="Username"
            value={username}
            onChange={handleUNChange}
          />
        </div>
        {/* <div>
          <TextField
            id="outlined-required"
            label="Password"
            variant="outlined"
            defaultValue="Password"
            value={password}
            onChange={handlePWChange}
          />
        </div> */}
        <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined">
          <InputLabel htmlFor={`${outlinedPasswordId}-input`}>Password</InputLabel>
          <OutlinedInput
            id={`${outlinedPasswordId}-input`}
            type={showPassword ? 'text' : 'password'}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label={showPassword ? 'hide the password' : 'display the password'}
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  onMouseUp={handleMouseUpPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label="Password"
            value={password}
            onChange={handlePWChange}
          />
        </FormControl>
        <div>
          <Button
            type="submit"
            variant="contained"
            style={{
              marginTop: 10,
              backgroundColor: '#a26991',
            }}
          >
            Sign in
          </Button>
        </div>
      </Box>

      {/* <TextField id="outlined-multiline-flexible" label="Multiline" multiline maxRows={4} /> */}

      {/* <form onSubmit={handleLogin}>
        <div>
          <label>
            <input
              type="text"
              value={username}
              placeholder="Enter your name"
              onChange={handleUNChange}
              //onChange={({ target }) => setUsername(target.value)}
            />
          </label>
        </div>
        <label>
          <input
            type="password"
            value={password}
            placeholder="password"
            onChange={handlePWChange}
          />
        </label>
        <button type="submit">login</button>
      </form> */}
    </div>
  );
};

export default LoginForm;
