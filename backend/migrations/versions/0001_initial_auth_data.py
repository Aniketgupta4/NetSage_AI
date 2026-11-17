"""Initial users, diagnoses and reviews tables."""
from alembic import op
import sqlalchemy as sa
revision = '0001_initial'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Use ORM metadata to keep the first local schema aligned with the models.
    from backend.db.database import Base
    from backend.db import entities
    bind = op.get_bind()
    Base.metadata.create_all(bind=bind)

def downgrade():
    from backend.db.database import Base
    from backend.db import entities
    bind = op.get_bind()
    Base.metadata.drop_all(bind=bind)
