/*
      # Add preco_desconto column to produtos table

      1. Changes
        - Add `preco_desconto` column to `produtos` table
        - Column type: numeric
        - Nullable: true
    */

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'produtos' AND column_name = 'preco_desconto'
      ) THEN
        ALTER TABLE produtos ADD COLUMN preco_desconto numeric;
      END IF;
    END $$;
