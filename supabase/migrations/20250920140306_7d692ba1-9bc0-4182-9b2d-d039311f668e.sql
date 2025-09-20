-- Add UPDATE policy to allow users to mark messages as read
CREATE POLICY "Users can mark received messages as read" 
ON public.messages 
FOR UPDATE 
USING (receiver_id = auth.uid());