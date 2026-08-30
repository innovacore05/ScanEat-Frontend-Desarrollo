//Este archivo contiene funciones para interactuar con la API de autenticación
type ApiError = {
    message?: string;
    [key: string]: unknown;
};

//Es la url base de la API de autenticación
const AUTH_BASE_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

//Función para registrar un nuevo usuario
export const register = async (
    first_name: string,
    last_name: string,
    email: string,
    password: string,
    code: string,
    role_id: string | number,
) => {
    const response = await fetch(`${AUTH_BASE_URL}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            first_name,
            last_name,
            email,
            password,
            code,
            role_id,
        }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw data as ApiError;
    }

    return data as {
        message: string;
        email?: string;
    };
};

//Función para verificar el correo electrónico del usuario
export const verifyEmail = async (email: string, code: string) => {
    const response = await fetch(`${AUTH_BASE_URL}/verify-email`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw data as ApiError;
    }

    return data as { message: string };
};

//Función para reenviar el código de verificación al correo electrónico del usuario
export const resendVerificationCode = async (email: string) => {
    const response = await fetch(`${AUTH_BASE_URL}/resend-verification-code`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw data as ApiError;
    }

    return data as { message: string; verificationCode?: string };
};

// función para iniciar sesión
export const login = async (email: string, password: string) => {
    const response = await fetch(`${AUTH_BASE_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw data as ApiError;
    }

    return data as {
        message: string;
        requiresTwoFactor?: boolean;
        token?: string;
        user?: Record<string, unknown>;
    };
};

//Función para verificar el código de inicio de sesión
export const verifyLoginCode = async (email: string, code: string) => {
    const response = await fetch(`${AUTH_BASE_URL}/verify-login-code`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw data as ApiError;
    }

    return data as {
        message: string;
        token?: string;
        user?: Record<string, unknown>;
    };
};

//Función para reenviar el código el login code al correo electrónico del usuario
export const resendLoginCode = async (email: string) => {
    const response = await fetch(`${AUTH_BASE_URL}/resend-login-code`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw data as ApiError;
    }

    return data as { message: string; verificationCode?: string };
};

//Función para iniciar recuperación de contraseña
export const forgotPassword = async (email: string) => {
    const response = await fetch(`${AUTH_BASE_URL}/forgot-password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw data as ApiError;
    }

    return data as { message: string };
};

export const verifyResetCode = async (
    email: string,
    code: string
) => {
    const response = await fetch(`${AUTH_BASE_URL}/verify-reset-code`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            code,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "No se pudo verificar el código"
        );
    }

    return data;
};

//Función para resetear la contraseña del usuario
export const resetPassword = async (
    email: string,
    code: string,
    newPassword: string,
) => {
    const response = await fetch(`${AUTH_BASE_URL}/reset-password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code, newPassword }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw data as ApiError;
    }

    return data as { message: string };
};

//Función para reenviar el reset code al correo electrónico del usuario
export const resendResetCode = async (email: string) => {
    const response = await fetch(`${AUTH_BASE_URL}/resend-reset-code`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw data as ApiError;
    }

    return data as { message: string; verificationCode?: string };
};


//editar perfil 
export const editProfile = async (changes: {
    first_name?: string,
    last_name?: string, 
    email?: string,
})  => {

    const token = localStorage.getItem("authToken");
    const response = await fetch(`${AUTH_BASE_URL}/edit-profile`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(changes),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw data as ApiError;
    }

   return data as {
        message: string;
        user?: {
            userId: number;
            firstName: string;
            lastName: string;
            email: string;
            roleId: number;
        };
        requiresEmailVerification?: boolean;
    };
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
) => {
  const token = localStorage.getItem("authToken");

 const response = await fetch(`${AUTH_BASE_URL}/change-password`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      currentPassword,
      newPassword,
      confirmPassword,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw data as { message?: string };
  }

  return data as { message: string };
};


//Función para verificar el nuevo correo tras un cambio de perfil
export const verifyProfileEmail = async (code: string) => {
    const token = localStorage.getItem("authToken");
    const response = await fetch(`${AUTH_BASE_URL}/verify-profile-email`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ code }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw data as ApiError;
    }

    return data as { message: string };
};

//funcion para obtener la informacion del usuario y mostrarla en fornt
export const getProfile = async () => {
  const token = localStorage.getItem("authToken");

  const response = await fetch(`${AUTH_BASE_URL}/profile`, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw data as ApiError;
  }

  return data as {
    user: {
      userId: number;
      firstName: string;
      lastName: string;
      email: string;
      roleId: number;
    };
  };
};