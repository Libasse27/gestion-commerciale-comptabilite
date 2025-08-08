// client/src/pages/parametres/RolesPage.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Row, Col, Form, Button, ListGroup } from 'react-bootstrap';
import { ShieldCheck } from 'react-bootstrap-icons';

import { fetchRoles, fetchPermissions, updateRole } from '../../store/slices/rolesSlice';
import Loader from '../../components/common/Loader';
import { useNotification } from '../../context/NotificationContext';
import { TOAST_TYPES } from '../../utils/constants';

const RolesPage = () => {
  const dispatch = useDispatch();
  const { roles, permissions, status, message } = useSelector((state) => state.roles);
  const isLoading = status === 'loading';
  const { addNotification } = useNotification();

  const [selectedRole, setSelectedRole] = useState(null);
  const [rolePermissions, setRolePermissions] = useState(new Set());

  useEffect(() => {
    dispatch(fetchRoles());
    dispatch(fetchPermissions());
  }, [dispatch]);
  
  const handleRoleSelect = (role) => {
      setSelectedRole(role);
      setRolePermissions(new Set(role.permissions.map(p => p.name)));
  }

  const handlePermissionChange = (permissionName) => {
      const newPermissions = new Set(rolePermissions);
      if (newPermissions.has(permissionName)) {
          newPermissions.delete(permissionName);
      } else {
          newPermissions.add(permissionName);
      }
      setRolePermissions(newPermissions);
  }

  const handleSaveChanges = () => {
      if (!selectedRole) return;
      
      const updateData = { permissions: Array.from(rolePermissions) };
      dispatch(updateRole({ roleId: selectedRole._id, updateData }))
        .unwrap()
        .then(() => addNotification('Permissions mises à jour.', TOAST_TYPES.SUCCESS))
        .catch(err => addNotification(err, TOAST_TYPES.ERROR));
  }

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col><h1><ShieldCheck className="me-3" />Rôles et Permissions</h1></Col>
      </Row>

      <Row>
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Header>Rôles</Card.Header>
            <ListGroup variant="flush">
              {roles.map(role => (
                <ListGroup.Item key={role._id} action active={selectedRole?._id === role._id} onClick={() => handleRoleSelect(role)}>
                  {role.name}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>

        <Col md={8}>
            <Card className="shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center">
                    Permissions pour le rôle : <strong>{selectedRole?.name || '...'}</strong>
                    {selectedRole && <Button onClick={handleSaveChanges} disabled={isLoading}>Enregistrer</Button>}
                </Card.Header>
                <Card.Body>
                    {isLoading && <Loader centered />}
                    {!selectedRole && <p className="text-muted text-center p-5">Sélectionnez un rôle pour voir ses permissions.</p>}
                    {selectedRole && Object.entries(permissions).map(([group, perms]) => (
                        <div key={group} className="mb-3">
                            <h5>{group}</h5>
                            <hr className="mt-1" />
                            {perms.map(perm => (
                                <Form.Check 
                                    type="checkbox"
                                    id={`perm-${perm._id}`}
                                    key={perm._id}
                                    label={perm.description || perm.name}
                                    checked={rolePermissions.has(perm.name)}
                                    onChange={() => handlePermissionChange(perm.name)}
                                />
                            ))}
                        </div>
                    ))}
                </Card.Body>
            </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RolesPage;