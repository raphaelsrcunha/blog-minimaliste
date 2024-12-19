const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../mysql/db');

const secretKey = 'mySecretKey';

// LOGIN ET SIGNUP

//Signup
router.post('/register', (req, res) => {
    const { username, password, role} = req.body;

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if(err) return res.status(500).json({ message: "Error hashing password" });

        const sql = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';

        db.query(sql, [username, hashedPassword, role], (err, result) => {
            if(err) return res.status(500).json({ message: "Error registering user"});

            res.status(201).json({ message: "User registered successfully" });
        })

    })
})

//Login

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = "SELECT * FROM users WHERE username = ?";

    db.query(sql, [username, password], (err, result) => {
        if (err) return res.status(500).json({ message: "Error logging in" });

        if (result.length > 0) {
            const user = result[0];

            bcrypt.compare(password, user.password, (err, match) => {
                if (err) return res.status(500).json({ message: "Error checking password" });

                if (match) {
                    const token = jwt.sign({ userId: user.id, role: user.role }, secretKey, { expiresIn: '1h' });
                    res.json({ token });
                } else {
                    res.status(401).json({ message: 'Invalid credentials' });
                }
            });
        } else {
            res.status(401).json({ message: "Invalid credentials" });
        }
    })
})

const authenticateJWT = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token missing' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        req.user = decoded;
        console.log(decoded)
        next();
    });
};


router.get('/user', authenticateJWT, (req, res) => {
    const sql = 'SELECT id, username FROM users WHERE id = ?';
    
    db.query(sql, [req.user.userId], (err, results) => {

        if (err) return res.status(500).json({ message: 'Error fetching user data' });
    
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).json({ message: 'User not found' });
        }

    });
});

const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        const role = req.user.role;

        if (!allowedRoles.includes(role)) {
            return res.status(403).json({ message: "Access denied. Seulement ADMIN peut avoir la liste complète d'utilisateurs." });
        }

        next();
    };
};


router.get('/users', authenticateJWT, checkRole(['admin']), (req, res) => {
    
    const getAllUsersSql = 'SELECT * FROM users';

    db.query(getAllUsersSql, (err, result) => {
        if (err) return res.status(500).json({ message: err});

        res.status(200).json(result);
    })
    
    const sql = 'SELECT * FROM users';
})

router.delete('/user', authenticateJWT, (req, res) => {
    const sql = "DELETE FROM users WHERE id = ?";

    db.query(sql, [req.user.userId], (err, results) => {
        if (err) {
            console.error("Database Error:", err); // Log para depuração
            return res.status(500).json({ message: 'Error deleting user', error: err.message });
        }

        if (results.affectedRows > 0) {
            res.status(202).json({ message: "Utilisateur a été supprimé avec succès!" });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    });
});


router.put('/user/:id?', authenticateJWT, async (req, res) => {
    const { userId, role } = req.user; 
    const targetUserId = req.params.id || userId; 
    const { newUsername, newPassword, newRole } = req.body;

    if (!newUsername || !newPassword || (role === 'admin' && req.params.id && !newRole)) {
        return res.status(400).json({ message: 'Tous les champs requis ne sont pas fournis!' });
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        let sql = '';
        let params = [];

        if (role === 'admin' && req.params.id) {
            sql = 'UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?';
            params = [newUsername, hashedPassword, newRole, targetUserId];
        } else if (role !== 'admin' && req.params.id && targetUserId !== userId) {
            return res.status(403).json({ message: "Accès refusé. Vous ne pouvez pas mettre à jour cet utilisateur." });
        } else {
            sql = 'UPDATE users SET username = ?, password = ? WHERE id = ?';
            params = [newUsername, hashedPassword, targetUserId];
        }

        db.query(sql, params, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Erreur serveur.', error: err });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Utilisateur non trouvé!" });
            }

            res.status(200).json({ message: "Utilisateur mis à jour avec succès!" });
        });
    } catch (err) {
        return res.status(500).json({ message: 'Erreur serveur.', error: err });
    }
});

// POSTS

router.post('/posts', authenticateJWT, (req, res) => {
    
    const content = req.body.content;

    const sql = 'INSERT INTO posts (user_id, content) VALUES (?, ?)';

    db.query(sql, [req.user.userId, content], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }

        res.status(201).json({ message: "Post a crée avec succès!"})
    })

})

router.get('/posts', authenticateJWT, (req, res) => {
    const sql = 'SELECT * FROM posts';

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Erro ao consultar o banco de dados:", err);
            return res.status(500).send("Erro ao consultar o banco de dados.");
        }
        res.status(200).json(results);
    });
});

router.get('/posts/:id', authenticateJWT, (req, res) => {

    const sql = 'SELECT * FROM posts WHERE id = ?';
    const postId = req.params.id;

    db.query(sql, [postId], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }

        if(result.length === 0) {
            return res.status(404).send(`Post avec id = ${postId} n'a été trouvé!`);
        }

        res.json(result[0]);
    })

})

router.put('/posts/:id', authenticateJWT, (req, res) => {
    const postId = req.params.id;
    const newContent = req.body.content;

    const sql = 'UPDATE posts SET content = ? WHERE id = ?';

    db.query(sql, [newContent, postId], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Post non trouvé!" });
        }

        res.status(200).json({ message: "Post mis à jour avec succès!" });
    });
});


router.delete('/posts/:id', authenticateJWT, (req, res) => {

    const postId = req.params.id;

    const sql = 'DELETE FROM posts WHERE id = ?';

    db.query(sql, postId, (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Post non trouvé!" });
        }

        res.status(201).json({ message: "Post a été supprimé avec succès!"})
    })
})

//COMMENTS

router.post('/posts/:postId/comments', authenticateJWT, (req, res) => {
    
    const postId = req.params.postId;
    const content = req.body.content;

    const sql = 'INSERT INTO comments (content, user_id, post_id) VALUES (?, ?, ?)';

    db.query(sql, [content, req.user.userId, postId], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }

        res.status(201).json({ message: "Commentaire a crée avec succès!"})
    })

})

router.get('/comments', authenticateJWT, (req, res) => {
    const { role, userId } = req.user;

    let sql;
    let params = [];

    if (role === 'admin') {
        sql = 'SELECT * FROM comments';
    } else {
        sql = 'SELECT * FROM comments WHERE user_id = ?';
        params = [userId];
    }

    db.query(sql, params, (err, result) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur.', error: err });
        res.json(result);
    });
});

router.put('/comments/:commentId', authenticateJWT, (req, res) => {
    const commentId = req.params.commentId;
    const content = req.body.content;
    const userId = req.user.userId; 

    const checkCommentUserSql = 'SELECT user_id FROM comments WHERE id = ?';

    db.query(checkCommentUserSql, [commentId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Erreur serveur.", error: err });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: "Commentaire non trouvé!" });
        }

        const commentUserId = result[0].user_id;

        if (commentUserId !== userId) {
            return res.status(403).json({ message: "Accès refusé. Vous ne pouvez pas modifier ce commentaire." });
        }

        const updateCommentSql = 'UPDATE comments SET content = ? WHERE id = ?';

        db.query(updateCommentSql, [content, commentId], (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Erreur serveur.", error: err });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Commentaire non trouvé!" });
            }

            res.status(200).json({ message: "Commentaire mis à jour avec succès!" });
        });
    });
});


router.delete('/comments/:commentId', authenticateJWT, (req, res) => {
    const commentId = req.params.commentId;
    const userId = req.user.userId;

    const checkCommentUserSql = 'SELECT user_id FROM comments WHERE id = ?';

    db.query(checkCommentUserSql, [commentId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Erreur serveur.", error: err });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: "Commentaire non trouvé!" });
        }

        const commentUserId = result[0].user_id;

        if (commentUserId !== userId) {
            return res.status(403).json({ message: "Accès refusé. Vous ne pouvez pas supprimer ce commentaire." });
        }

        const deleteCommentSql = 'DELETE FROM comments WHERE id = ?';

        db.query(deleteCommentSql, [commentId], (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Erreur serveur.", error: err });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Commentaire non trouvé!" });
            }

            res.status(200).json({ message: "Commentaire supprimé avec succès!" });
        });
    });
});

module.exports = router;