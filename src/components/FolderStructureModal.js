import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button } from './SharedStyles';
import { useAppContext } from '../contexts/AppContext';

const ModalBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: ${props => props.theme.background};
  border-radius: 8px;
  width: 80%;
  max-width: 600px;
  max-height: 80%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${props => props.theme.borderColor};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: ${props => props.theme.text};
`;

const ModalBody = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 8px;
`;

const ModalFooter = styled.div`
  padding: 8px;
  border-top: 1px solid ${props => props.theme.borderColor};
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const ItemList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

const ItemListItem = styled.li`
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: ${props => props.theme.text};

  &:hover {
    background-color: ${props => props.theme.hoverBackground};
  }
`;

const ItemIcon = styled.span`
  margin-right: 8px;
  font-size: 1.0em;
`;

const CurrentPath = styled.div`
  margin-bottom: 16px;
  padding: 8px;
  background-color: ${props => props.theme.inputBackground};
  border: 1px solid ${props => props.theme.borderColor};
  border-radius: 0px;
  color: ${props => props.theme.text};
`;

const FolderStructureModal = ({ isOpen, onClose, theme, projectPath, setProjectPath }) => {
  const [items, setItems] = useState([]);
  const [currentPath, setCurrentPath] = useState(projectPath);
  const { api, updateProjectPath } = useAppContext();

  useEffect(() => {
    if (isOpen) {
      fetchFolderStructure(projectPath);
    }
  }, [isOpen, projectPath]);

  const fetchFolderStructure = async (path) => {
    try {
      const data = await api.listItems({ path });
      if (data.status === 'success') {
        setCurrentPath(data.project_path);
        setItems([
          { name: '..', isFolder: true, isParent: true },
          ...data.folders.map(folder => ({ name: folder, isFolder: true })),
          ...data.files.map(file => ({ name: file, isFolder: false }))
        ]);
      }
    } catch (error) {
      console.error('Error fetching folder structure:', error);
    }
  };

  const handleItemClick = async (item) => {
    if (item.isFolder) {
      let newPath;
      if (item.isParent) {
        newPath = currentPath.split('/').slice(0, -1).join('/');
      } else {
        newPath = currentPath ? `${currentPath}/${item.name}` : item.name;
      }
      fetchFolderStructure(newPath);
    }
  };

  const handleOpenClick = () => {
    setProjectPath(currentPath);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalBackground onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()} theme={theme}>
        <ModalHeader>
          <ModalTitle>Select Folder</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <CurrentPath theme={theme}>{currentPath}</CurrentPath>
          <ItemList>
            {items.map((item, index) => (
              <ItemListItem
                key={index}
                onClick={() => handleItemClick(item)}
                theme={theme}
              >
                <ItemIcon>
                  {item.isParent ? '📂' : item.isFolder ? '📁' : '📄'}
                </ItemIcon>
                {item.name}
              </ItemListItem>
            ))}
          </ItemList>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleOpenClick}>Open</Button>
        </ModalFooter>
      </ModalContent>
    </ModalBackground>
  );
};

export default FolderStructureModal;
