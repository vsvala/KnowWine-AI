import { useState } from 'react';

interface LoginFormProps {
  login: (username: string, password: string) => Promise<void>;
}

const LoginForm = ({ login }: LoginFormProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e?.preventDefault();
    console.log('loggin with ', username, password);
    login(username, password);
    setUsername('');
    setPassword('');
  };

  const handlePWChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    console.log(password);
  };

  const handleUNChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    console.log(username);
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
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
      </form>
    </div>
  );
};

export default LoginForm;
