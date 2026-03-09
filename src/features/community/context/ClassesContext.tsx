import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { CommunityChildrenClass, getCommunityChildrensClasses } from '../../../services/classesService';

type ClassesContextValue = {
  classes: CommunityChildrenClass[];
  myClasses: CommunityChildrenClass[];
  isLoading: boolean;
  error?: string;
  refreshClasses: () => Promise<void>;
};

const ClassesContext = createContext<ClassesContextValue | undefined>(undefined);

export function ClassesProvider({ children }: PropsWithChildren) {
  const { authSession, isAuthenticated } = useAuth();
  const [classes, setClasses] = useState<CommunityChildrenClass[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const communityId = authSession?.community?.id;
  const authUserId = authSession?.user.id;
  const authUserName = authSession?.user.name.trim().toLowerCase();

  const refreshClasses = useCallback(async () => {
    if (!authSession?.token || !communityId) {
      setClasses([]);
      setError(undefined);
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      const nextClasses = await getCommunityChildrensClasses(authSession.token);
      setClasses(nextClasses);
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : "Unable to load community children's classes.";
      setError(message);
      throw loadError;
    } finally {
      setIsLoading(false);
    }
  }, [authSession?.token, communityId]);

  const myClasses = useMemo(
    () =>
      classes.filter(classItem => {
        if (!authSession?.user) {
          return false;
        }

        if (authUserId && classItem.facilitatorIds.includes(authUserId)) {
          return true;
        }

        return Boolean(
          authUserName &&
            classItem.facilitators.some(facilitator => facilitator.trim().toLowerCase() === authUserName),
        );
      }),
    [authSession?.user, authUserId, authUserName, classes],
  );

  useEffect(() => {
    if (!isAuthenticated || !authSession?.token || !communityId) {
      setClasses([]);
      setError(undefined);
      setIsLoading(false);
      return;
    }

    refreshClasses().catch(loadError => {
      console.error('Failed to load community classes', loadError);
    });
  }, [authSession?.token, communityId, isAuthenticated, refreshClasses]);

  const value = useMemo<ClassesContextValue>(
    () => ({
      classes,
      myClasses,
      isLoading,
      error,
      refreshClasses,
    }),
    [classes, error, isLoading, myClasses, refreshClasses],
  );

  return <ClassesContext.Provider value={value}>{children}</ClassesContext.Provider>;
}

export function useClasses() {
  const context = useContext(ClassesContext);

  if (!context) {
    throw new Error('useClasses must be used within a ClassesProvider.');
  }

  return context;
}
