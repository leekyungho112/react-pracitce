import styled from '@emotion/styled';
import { Box, Button, TextField } from '@mui/material';
import React, { useState } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
const Container = styled.div`
  flex: 6;
  margin-top: 70px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const Login = () => {
  const [inputs, setInputs] = useState({
    username: '',
    password: '',
  });
  const [user, setUser] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const { username, password } = inputs;
  const onChange = (e) => {
    const { value, name } = e.target;
    setInputs({
      ...inputs,
      [name]: value,
    });
  };

  const refreshToken = async () => {
    try {
      const res = await axios.post('/refresh', { token: user.refreshToken });
      setUser({
        ...user,
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
      });
      return res.data;
    } catch (error) {
      console.log(error);
    }
  };

  const axiosJWT = axios.create();

  axiosJWT.interceptors.request.use(
    async (config) => {
      let currentDate = new Date();
      const decodedToken = jwt_decode(user.accessToken);
      if (decodedToken.exp * 1000 < currentDate.getTime()) {
        const data = await refreshToken();
        config.headers['authorization'] = `Bearer ${data.accessToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/login', {
        username,
        password,
      });
      setUser(res.data);
    } catch (error) {
      console.log(error);
    }
    setInputs({ username: '', password: '' });
  };
  console.log(user);

  const handleDelete = async (id) => {
    setSuccess(false);
    setError(false);
    try {
      // await axiosJWT.delete("/users/" + id, {
      //   headers: { authorization: "Bearer " + user.accessToken },
      // });
      await axiosJWT.delete(`/users/${id}`, {
        headers: { authorization: `Bearer ${user.accessToken}` },
      });
      setSuccess(true);
    } catch (err) {
      setError(true);
    }
  };
  return (
    <Container>
      {user ? (
        <div className="home">
          <span>
            Welcome to the <b>{user.isAdmin ? 'admin' : 'user'}</b> dashboard{' '}
            <b>{user.username}</b>.
          </span>
          <span>Delete Users:</span>
          <button className="deleteButton" onClick={() => handleDelete(1)}>
            Delete John
          </button>
          <button className="deleteButton" onClick={() => handleDelete(2)}>
            Delete Jane
          </button>
          {error && (
            <span className="error">
              You are not allowed to delete this user!
            </span>
          )}
          {success && (
            <span className="success">
              User has been deleted successfully...
            </span>
          )}
        </div>
      ) : (
        <Box component="form" onSubmit={onSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="username"
            name="username"
            autoFocus
            onChange={onChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            onChange={onChange}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default Login;
